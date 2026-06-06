from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from fpdf import FPDF
from datetime import datetime
import io

router = APIRouter()

class ExpenseItem(BaseModel):
    category:     str
    description:  Optional[str] = ''
    amount:       float
    expense_date: str

class IncomeItem(BaseModel):
    source:         str
    quantity:       Optional[float] = None
    unit:           Optional[str]   = ''
    price_per_unit: Optional[float] = None
    total_amount:   float
    sale_date:      str

class ReportData(BaseModel):
    crop_name:     str
    field_area:    float
    area_unit:     str
    start_date:    str
    total_expense: float
    total_income:  float
    net_profit:    float
    is_profitable: bool
    expenses:      List[ExpenseItem]
    incomes:       List[IncomeItem]

# Category mapping: keys are internal (Roman Urdu), values are English display
CATEGORIES = {
    'beej': 'Seed',
    'khaad': 'Fertilizer',
    'paani': 'Irrigation',
    'dawai': 'Pesticide',
    'labour': 'Labor',
    'other': 'Other',
}

@router.post("/profit-loss")
async def generate_pdf(data: ReportData):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # ── Header ────────────────────────────────
    pdf.set_fill_color(11, 61, 32)
    pdf.rect(0, 0, 210, 42, 'F')
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(10, 10)
    pdf.cell(0, 10, 'KisanAI - Profit / Loss Report', ln=True)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_xy(10, 23)
    pdf.cell(0, 7, f'Crop: {data.crop_name}  |  Land: {data.field_area} {data.area_unit}  |  Start: {data.start_date}')
    pdf.set_xy(10, 32)
    pdf.cell(0, 7, f'Report Date: {datetime.now().strftime("%d %B %Y")}')

    # ── Summary Boxes ─────────────────────────
    pdf.set_text_color(0, 0, 0)
    boxes = [
        ((220,38,38),  'Total Expense', f'Rs {data.total_expense:,.0f}'),
        ((21,128,61),  'Total Income',  f'Rs {data.total_income:,.0f}'),
        ((37,99,235) if data.is_profitable else (220,38,38),
         'Net Profit' if data.is_profitable else 'Net Loss',
         f'Rs {abs(data.net_profit):,.0f}'),
    ]
    for i,(color,label,value) in enumerate(boxes):
        x = 10 + i*66
        pdf.set_fill_color(*color)
        pdf.rect(x, 50, 62, 26, 'F')
        pdf.set_text_color(255,255,255)
        pdf.set_font('Helvetica','B',9)
        pdf.set_xy(x+3, 54)
        pdf.cell(56, 6, label)
        pdf.set_font('Helvetica','B',13)
        pdf.set_xy(x+3, 61)
        pdf.cell(56, 8, value)

    # ── Expenses Table ────────────────────────
    pdf.set_text_color(0,0,0)
    pdf.set_xy(10, 86)
    pdf.set_font('Helvetica','B',11)
    pdf.cell(0, 8, 'Expense Details', ln=True)

    pdf.set_fill_color(27,77,46)
    pdf.set_text_color(255,255,255)
    pdf.set_font('Helvetica','B',9)
    for h,w in [('Date',30),('Category',45),('Description',70),('Amount',35)]:
        pdf.cell(w, 8, h, border=1, fill=True)
    pdf.ln()

    pdf.set_text_color(0,0,0)
    pdf.set_font('Helvetica','',9)
    for i,e in enumerate(data.expenses):
        fill = i%2==0
        pdf.set_fill_color(245,255,245) if fill else pdf.set_fill_color(255,255,255)
        pdf.cell(30, 7, e.expense_date,                          border=1,fill=fill)
        pdf.cell(45, 7, CATEGORIES.get(e.category, e.category),  border=1,fill=fill)
        pdf.cell(70, 7, (e.description or '')[:30],              border=1,fill=fill)
        pdf.set_text_color(220,38,38)
        pdf.cell(35, 7, f'Rs {e.amount:,.0f}',                   border=1,fill=fill)
        pdf.set_text_color(0,0,0)
        pdf.ln()

    # ── Income Table ──────────────────────────
    pdf.ln(4)
    pdf.set_font('Helvetica','B',11)
    pdf.cell(0, 8, 'Income Details', ln=True)

    pdf.set_fill_color(27,77,46)
    pdf.set_text_color(255,255,255)
    pdf.set_font('Helvetica','B',9)
    for h,w in [('Date',30),('Source',55),('Quantity',45),('Amount',50)]:
        pdf.cell(w, 8, h, border=1, fill=True)
    pdf.ln()

    pdf.set_text_color(0,0,0)
    pdf.set_font('Helvetica','',9)
    for i,inc in enumerate(data.incomes):
        fill = i%2==0
        pdf.set_fill_color(245,255,245) if fill else pdf.set_fill_color(255,255,255)
        qty_str = f'{inc.quantity} {inc.unit}' if inc.quantity else '-'
        pdf.cell(30, 7, inc.sale_date,              border=1,fill=fill)
        pdf.cell(55, 7, inc.source[:22],            border=1,fill=fill)
        pdf.cell(45, 7, qty_str,                    border=1,fill=fill)
        pdf.set_text_color(21,128,61)
        pdf.cell(50, 7, f'Rs {inc.total_amount:,.0f}', border=1,fill=fill)
        pdf.set_text_color(0,0,0)
        pdf.ln()

    # ── Footer ────────────────────────────────
    pdf.set_y(-15)
    pdf.set_font('Helvetica','I',8)
    pdf.set_text_color(150,150,150)
    pdf.cell(0, 5, 'KisanAI - Smart Farming Assistant | kisanai.pk', align='C')

    pdf_bytes = bytes(pdf.output())
    filename  = f'KisanAI_{data.crop_name}_{datetime.now().strftime("%Y%m%d")}.pdf'
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename={filename}'}
    )