import os
import re
import pytesseract
from typing import List
from datetime import datetime, timedelta
from ocr_pipeline.graph.base_graph_extractor import BaseGraphExtractor
from ocr_pipeline.graph.graph_registry import GraphRegistry
from ocr_pipeline.models.bill_schema import PaymentHistoryItem

tesseract_cmd_paths = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
]
for t_path in tesseract_cmd_paths:
    if os.path.exists(t_path):
        pytesseract.pytesseract.tesseract_cmd = t_path
        break

tessdata_local = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tessdata"))
if os.path.exists(tessdata_local):
    os.environ["TESSDATA_PREFIX"] = tessdata_local

@GraphRegistry.register
class TorrentGraphExtractor(BaseGraphExtractor):
    """
    Dedicated Graph Extractor for Torrent Power Electricity Bills.
    Supports English & Marathi bar chart formats e.g. 'मागील वीज वापर' (Past Electricity Consumption).
    """

    @property
    def provider_key(self) -> str:
        return "torrent"

    def _get_previous_months(self, bill_date_str: str, num_months: int = 12):
        formats = ["%d-%b-%y", "%d-%b-%Y", "%d-%m-%Y", "%d-%m-%y", "%b-%Y", "%m-%Y"]
        clean_str = bill_date_str.replace("/", "-").replace(" ", "-").strip() if bill_date_str else ""
        clean_str = re.sub(r'^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$', '', clean_str)

        bill_date = None
        for fmt in formats:
            try:
                bill_date = datetime.strptime(clean_str, fmt)
                break
            except ValueError:
                continue
        if not bill_date:
            bill_date = datetime.now()

        months = []
        curr_date = bill_date
        for i in range(num_months):
            first = curr_date.replace(day=1)
            prev_month = first - timedelta(days=1)
            months.append(prev_month.strftime("%b-%Y"))
            curr_date = prev_month
        return months

    def extract_history(self, text: str, page_image=None, bill_date_str: str = "") -> List[PaymentHistoryItem]:
        payment_map = {}  # month_key -> amount_str

        # 1. Parse Payment History table from text (Page 2 / text)
        p_items = re.findall(r'(\d{1,2}[\-\/\.][A-Za-z]{3,9}[\-\/\.]\d{2,4})\s+([0-9\.,]+)', text)
        for d_str, a_str in p_items:
            try:
                digits_only = re.sub(r'[^\d\.]', '', a_str)
                if not digits_only or digits_only == ".":
                    continue
                amt_clean = float(digits_only)
                if 50 <= amt_clean <= 50000:
                    m_match = re.search(r'([A-Za-z]{3,9})[\-\/\.](\d{2,4})', d_str)
                    if m_match:
                        m_name = m_match.group(1)[:3].capitalize()
                        yr = m_match.group(2)
                        if len(yr) == 2:
                            yr = "20" + yr
                        m_key = f"{m_name.lower()}-{yr}"
                        payment_map[m_key] = f"₹{amt_clean:,.0f}"
            except (ValueError, TypeError):
                continue

        # 2. Extract Bar Chart numbers from page 1 image if available
        cols = []
        if page_image is not None:
            try:
                w, h = page_image.size
                df = pytesseract.image_to_data(page_image, lang="eng", config="--psm 11", output_type=pytesseract.Output.DATAFRAME)
                df = df[df['text'].notna()]
                df['text'] = df['text'].astype(str).str.strip()
                df = df[(df['text'] != "") & (df['conf'] >= 25)]

                # Strict bounding box for Torrent bar chart numbers (x: 25.5% to 66% of width, y: 50% to 72% of height)
                chart_df = df[(df['left'] >= 0.255 * w) & (df['left'] <= 0.66 * w) & (df['top'] >= 0.50 * h) & (df['top'] <= 0.72 * h)]

                bar_tokens = []
                for idx, row in chart_df.iterrows():
                    t = row['text']
                    if t.isdigit():
                        val = int(t)
                        if 5 <= val <= 250:
                            bar_tokens.append({'val': val, 'left': row['left'], 'top': row['top']})

                for b in bar_tokens:
                    matched = False
                    for c in cols:
                        if abs(c['left'] - b['left']) < 40:
                            if b['top'] < c['top']:
                                c['val'] = b['val']
                                c['top'] = b['top']
                            matched = True
                            break
                    if not matched:
                        cols.append(b.copy())

                cols = sorted(cols, key=lambda x: x['left'])
            except Exception as e:
                print("Hybrid bar chart extraction failed in TorrentGraphExtractor:", e)

        # 3. Generate past 12 months list (1st back = Feb-2026, 2nd = Jan-2026, 3rd = Dec-2025, ...)
        months_list = self._get_previous_months(bill_date_str, 12)

        payment_history = []
        for i, m_display in enumerate(months_list):
            m_key = m_display.lower()
            units_str = "—"
            if i < len(cols):
                units_str = f"{cols[i]['val']} KWh"
            amt_str = payment_map.get(m_key, "—")
            
            # Only add records that have either units or amount extracted
            if units_str != "—" or amt_str != "—":
                payment_history.append(PaymentHistoryItem(
                    date=m_display,
                    units=units_str,
                    amount=amt_str
                ))

        def sort_hist_key(x: PaymentHistoryItem):
            try:
                d_clean = str(x.date or "").replace("/", "-").replace(" ", "-").strip()
                for fmt in ["%d-%b-%Y", "%b-%Y", "%d-%b-%y", "%Y-%m-%d", "%d-%m-%Y"]:
                    try:
                        return datetime.strptime(d_clean, fmt)
                    except (ValueError, TypeError):
                        continue
                return datetime.min
            except Exception:
                return datetime.min

        payment_history.sort(key=sort_hist_key, reverse=True)
        return payment_history



