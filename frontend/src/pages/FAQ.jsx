import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const FAQS = [
  {
    cat: 'general',
    q:   'What is KisanAI?',
    qUr: 'کسان اے آئی کیا ہے؟',
    a:   'KisanAI is a free smart farming app for Pakistani farmers. It uses Artificial Intelligence to detect crop diseases, show live mandi prices, provide weather forecasts, and answer any farming question through an AI chatbot — all in one place.',
    aUr: 'کسان اے آئی پاکستانی کسانوں کے لیے ایک مفت سمارٹ زراعت ایپ ہے۔ یہ مصنوعی ذہانت استعمال کرتے ہوئے فصل کی بیماری پہچانتی ہے، لائیو منڈی بھاؤ دکھاتی ہے، موسم کی پیش گوئی فراہم کرتی ہے، اور اے آئی چیٹ بوٹ کے ذریعے کسی بھی زراعتی سوال کا جواب دیتی ہے۔',
  },
  {
    cat: 'general',
    q:   'Is KisanAI completely free?',
    qUr: 'کیا کسان اے آئی بالکل مفت ہے؟',
    a:   'Yes, KisanAI is 100% free. There are no hidden charges, no subscription fees, and no premium plans. Create your account for free and use all features without paying anything.',
    aUr: 'جی ہاں، کسان اے آئی سو فیصد مفت ہے۔ کوئی چھپی ہوئی فیس نہیں، کوئی ماہانہ چارج نہیں، اور کوئی پریمیم پلان نہیں۔ مفت اکاؤنٹ بنائیں اور تمام خصوصیات بغیر کسی ادائیگی کے استعمال کریں۔',
  },
  {
    cat: 'general',
    q:   'Which mobile phones does KisanAI work on?',
    qUr: 'کسان اے آئی کن موبائل فونز پر کام کرتی ہے؟',
    a:   'KisanAI works on any Android or iPhone with a web browser. You do not need to download any app — simply open the website in your browser. It also works on computers and tablets.',
    aUr: 'کسان اے آئی کسی بھی اینڈرائیڈ یا آئی فون پر کام کرتی ہے جس میں ویب براؤزر ہو۔ آپ کو کوئی ایپ ڈاؤنلوڈ کرنے کی ضرورت نہیں — بس براؤزر میں ویب سائٹ کھولیں۔ یہ کمپیوٹر اور ٹیبلیٹ پر بھی چلتی ہے۔',
  },
  {
    cat: 'general',
    q:   'Do I need internet to use KisanAI?',
    qUr: 'کیا کسان اے آئی استعمال کرنے کے لیے انٹرنیٹ ضروری ہے؟',
    a:   'Most features require an internet connection. However, weather data, fasal calendar, and fertilizer guide can work offline once loaded, as the app saves data for offline use automatically.',
    aUr: 'زیادہ تر خصوصیات کے لیے انٹرنیٹ کنکشن ضروری ہے۔ تاہم موسم، فصل کیلنڈر، اور کھاد گائیڈ ایک بار لوڈ ہونے کے بعد انٹرنیٹ کے بغیر بھی کام کر سکتے ہیں کیونکہ ایپ خودبخود ڈیٹا محفوظ کر لیتی ہے۔',
  },
  {
    cat: 'disease',
    q:   'How does crop disease detection work?',
    qUr: 'فصل کی بیماری کی پہچان کیسے کام کرتی ہے؟',
    a:   'Take a clear photo of the affected part of your crop and upload it in the Disease Detection section. Our AI model analyzes the image within seconds and identifies the disease, its causes, and recommended treatment.',
    aUr: 'اپنی فصل کے متاثرہ حصے کی واضح تصویر لیں اور بیماری پہچان سیکشن میں اپلوڈ کریں۔ ہمارا اے آئی ماڈل چند سیکنڈ میں تصویر کا تجزیہ کرتا ہے اور بیماری، اس کے اسباب اور تجویز کردہ علاج بتاتا ہے۔',
  },
  {
    cat: 'disease',
    q:   'Which crops can be detected for diseases?',
    qUr: 'کن فصلوں کی بیماریاں پہچانی جا سکتی ہیں؟',
    a:   'KisanAI can detect diseases in wheat, rice, maize, cotton, tomato, potato, sugarcane, mango, and many other common Pakistani crops. The system is continuously improving with more crops being added.',
    aUr: 'کسان اے آئی گندم، چاول، مکئی، کپاس، ٹماٹر، آلو، گنا، آم اور پاکستان کی کئی دیگر عام فصلوں میں بیماریاں پہچان سکتی ہے۔ نظام مسلسل بہتر ہو رہا ہے اور مزید فصلیں شامل کی جا رہی ہیں۔',
  },
  {
    cat: 'disease',
    q:   'How accurate is the disease detection?',
    qUr: 'بیماری کی پہچان کتنی درست ہے؟',
    a:   'Our AI model is trained on thousands of crop images and achieves high accuracy. However, for serious or unusual diseases, we recommend also consulting a local agriculture officer or expert for confirmation.',
    aUr: 'ہمارا اے آئی ماڈل ہزاروں فصلوں کی تصاویر پر تربیت یافتہ ہے اور اعلیٰ درستگی حاصل کرتا ہے۔ تاہم سنگین یا غیر معمولی بیماریوں کے لیے تصدیق کی خاطر مقامی زرعی افسر یا ماہر سے بھی مشورہ کریں۔',
  },
  {
    cat: 'mandi',
    q:   'Where does KisanAI get mandi prices from?',
    qUr: 'کسان اے آئی منڈی بھاؤ کہاں سے لیتی ہے؟',
    a:   'Mandi prices are fetched directly from AMIS (Agricultural Marketing Information Service) Punjab, which is the official Government of Punjab source. Prices cover 140+ cities across Pakistan.',
    aUr: 'منڈی بھاؤ براہ راست اے ایم آئی ایس (زرعی مارکیٹنگ انفارمیشن سروس) پنجاب سے لیے جاتے ہیں جو حکومت پنجاب کا سرکاری ذریعہ ہے۔ بھاؤ پاکستان کے ۱۴۰ سے زیادہ شہروں کا احاطہ کرتے ہیں۔',
  },
  {
    cat: 'mandi',
    q:   'How often are mandi prices updated?',
    qUr: 'منڈی بھاؤ کتنی بار اپ ڈیٹ ہوتے ہیں؟',
    a:   'Mandi prices are automatically updated every night at 2 AM from the AMIS Punjab website. You can also manually refresh prices at any time by clicking the Refresh button inside the app.',
    aUr: 'منڈی بھاؤ ہر رات ۲ بجے اے ایم آئی ایس پنجاب ویب سائٹ سے خودبخود اپ ڈیٹ ہوتے ہیں۔ آپ ایپ کے اندر ریفریش بٹن دبا کر کسی بھی وقت بھاؤ دستی طور پر بھی تازہ کر سکتے ہیں۔',
  },
  {
    cat: 'mandi',
    q:   'Can I see prices for my specific city?',
    qUr: 'کیا میں اپنے مخصوص شہر کے بھاؤ دیکھ سکتا ہوں؟',
    a:   'Yes. KisanAI covers 140+ cities organized by district. You can search for your city by name or browse through your district to find local mandi prices for your area.',
    aUr: 'جی ہاں۔ کسان اے آئی ضلع کے مطابق ترتیب دیے گئے ۱۴۰ سے زیادہ شہروں کا احاطہ کرتی ہے۔ آپ اپنے شہر کا نام لکھ کر تلاش کر سکتے ہیں یا اپنے ضلع میں براؤز کر کے مقامی منڈی بھاؤ دیکھ سکتے ہیں۔',
  },
  {
    cat: 'weather',
    q:   'How does KisanAI get my location for weather?',
    qUr: 'کسان اے آئی موسم کے لیے میری لوکیشن کیسے لیتی ہے؟',
    a:   'KisanAI first tries to use your phone\'s GPS with your permission. If GPS is not available, it uses your internet connection to detect your approximate location. You can also manually select your city from the list.',
    aUr: 'کسان اے آئی پہلے آپ کی اجازت سے آپ کے فون کا جی پی ایس استعمال کرنے کی کوشش کرتی ہے۔ اگر جی پی ایس دستیاب نہ ہو تو انٹرنیٹ کنکشن سے آپ کی تقریبی لوکیشن معلوم کرتی ہے۔ آپ فہرست میں سے اپنا شہر دستی طور پر بھی منتخب کر سکتے ہیں۔',
  },
  {
    cat: 'weather',
    q:   'How many days of weather forecast does KisanAI show?',
    qUr: 'کسان اے آئی کتنے دن کا موسم دکھاتی ہے؟',
    a:   'KisanAI shows a 7-day weather forecast including temperature, humidity, wind speed, and rainfall predictions. This helps you plan irrigation, spray schedules, and harvesting times in advance.',
    aUr: 'کسان اے آئی ۷ دن کی موسم کی پیش گوئی دکھاتی ہے جس میں درجہ حرارت، نمی، ہوا کی رفتار اور بارش کی پیش گوئی شامل ہے۔ اس سے آپ پہلے سے سینچائی، سپرے شیڈول اور کٹائی کے اوقات کی منصوبہ بندی کر سکتے ہیں۔',
  },
  {
    cat: 'ai',
    q:   'What can I ask the AI Chatbot?',
    qUr: 'اے آئی چیٹ بوٹ سے کیا پوچھ سکتا ہوں؟',
    a:   'You can ask the AI chatbot anything related to farming — which fertilizer to use, how to treat a specific disease, what crops to grow in a particular season, irrigation advice, pest control, soil improvement, government schemes, and much more. Ask in Urdu or English.',
    aUr: 'آپ اے آئی چیٹ بوٹ سے زراعت سے متعلق کچھ بھی پوچھ سکتے ہیں — کون سی کھاد استعمال کریں، کسی مخصوص بیماری کا علاج کیا ہے، کس موسم میں کون سی فصل اگائیں، سینچائی کی صلاح، کیڑے مار ادویات، مٹی کی بہتری، سرکاری اسکیمیں وغیرہ۔ اردو یا انگریزی میں پوچھیں۔',
  },
  {
    cat: 'ai',
    q:   'How accurate is the AI Chatbot?',
    qUr: 'اے آئی چیٹ بوٹ کتنا درست ہے؟',
    a:   'The AI chatbot provides very useful farming advice based on a vast knowledge base. However, AI can occasionally make mistakes. For critical decisions involving large investments, always verify with a qualified agriculture expert or extension officer.',
    aUr: 'اے آئی چیٹ بوٹ ایک وسیع علمی ذخیرے کی بنیاد پر بہت مفید زرعی مشورے فراہم کرتا ہے۔ تاہم اے آئی کبھی کبھار غلطی کر سکتا ہے۔ بڑی سرمایہ کاری سے متعلق اہم فیصلوں کے لیے ہمیشہ کسی قابل زرعی ماہر یا ایکسٹینشن افسر سے تصدیق کریں۔',
  },
  {
    cat: 'ai',
    q:   'Can I use KisanAI in Urdu?',
    qUr: 'کیا میں کسان اے آئی اردو میں استعمال کر سکتا ہوں؟',
    a:   'Yes, KisanAI fully supports Urdu. You can switch between Urdu and English using the language toggle button in the app. The AI chatbot also understands and responds in Urdu.',
    aUr: 'جی ہاں، کسان اے آئی مکمل طور پر اردو سپورٹ کرتی ہے۔ آپ ایپ میں زبان ٹوگل بٹن سے اردو اور انگریزی کے درمیان تبدیل ہو سکتے ہیں۔ اے آئی چیٹ بوٹ بھی اردو میں سمجھتا اور جواب دیتا ہے۔',
  },
  {
    cat: 'account',
    q:   'How do I create an account?',
    qUr: 'اکاؤنٹ کیسے بنائیں؟',
    a:   'Click the Register button on the home page. Enter your name, email address, and a password. Your account will be created instantly and you can start using all features right away.',
    aUr: 'ہوم پیج پر رجسٹر بٹن دبائیں۔ اپنا نام، ای میل ایڈریس اور پاس ورڈ درج کریں۔ آپ کا اکاؤنٹ فوری طور پر بن جائے گا اور آپ تمام خصوصیات فوری استعمال کر سکتے ہیں۔',
  },
  {
    cat: 'account',
    q:   'I forgot my password. What should I do?',
    qUr: 'میں پاس ورڈ بھول گیا۔ کیا کروں؟',
    a:   'On the login page, click "Forgot Password". Enter your registered email address and we will send you a password reset link. Follow the instructions in the email to set a new password.',
    aUr: 'لاگ ان پیج پر "پاس ورڈ بھول گئے" پر کلک کریں۔ اپنا رجسٹرڈ ای میل ایڈریس درج کریں اور ہم آپ کو پاس ورڈ ری سیٹ لنک بھیجیں گے۔ نیا پاس ورڈ ترتیب دینے کے لیے ای میل میں دی گئی ہدایات پر عمل کریں۔',
  },
  {
    cat: 'account',
    q:   'Is my personal data safe?',
    qUr: 'کیا میرا ذاتی ڈیٹا محفوظ ہے؟',
    a:   'Yes, your personal data is completely secure. We do not share your information with any third party. Your farm data, expenses, and diary entries are private and only visible to you.',
    aUr: 'جی ہاں، آپ کا ذاتی ڈیٹا مکمل طور پر محفوظ ہے۔ ہم آپ کی معلومات کسی تیسرے فریق کے ساتھ شیئر نہیں کرتے۔ آپ کا فارم ڈیٹا، اخراجات اور ڈائری کا اندراج نجی ہے اور صرف آپ ہی دیکھ سکتے ہیں۔',
  },
  {
    cat: 'features',
    q:   'What is Crop Recommendation?',
    qUr: 'فصل تجویز کیا ہے؟',
    a:   'Crop Recommendation uses AI to suggest the best crops for your land. You enter your soil type, water availability, and location — and the AI analyzes conditions to recommend the most suitable and profitable crops for your farm.',
    aUr: 'فصل تجویز اے آئی کا استعمال کرتے ہوئے آپ کی زمین کے لیے بہترین فصلیں تجویز کرتی ہے۔ آپ اپنی مٹی کی قسم، پانی کی دستیابی اور لوکیشن درج کریں — اے آئی حالات کا تجزیہ کر کے آپ کے فارم کے لیے موزوں ترین اور منافع بخش فصلیں تجویز کرتی ہے۔',
  },
  {
    cat: 'features',
    q:   'What is Yield Prediction?',
    qUr: 'پیداوار کا اندازہ کیا ہے؟',
    a:   'Yield Prediction estimates how much crop you will harvest per acre based on your crop type, soil, fertilizer usage, and live weather data. It also alerts you when weather conditions may affect your expected yield.',
    aUr: 'پیداوار کا اندازہ آپ کی فصل کی قسم، مٹی، کھاد کے استعمال اور لائیو موسمی ڈیٹا کی بنیاد پر فی ایکڑ کتنی فصل حاصل ہوگی اس کا اندازہ لگاتا ہے۔ یہ آپ کو اس وقت بھی خبردار کرتا ہے جب موسمی حالات آپ کی متوقع پیداوار کو متاثر کر سکتے ہیں۔',
  },
  {
    cat: 'features',
    q:   'What is Fasal Diary?',
    qUr: 'فصل ڈائری کیا ہے؟',
    a:   'Fasal Diary allows you to keep a daily record of all your farm activities — sowing, irrigation, spraying, fertilizing, and harvesting. You can add notes, weather conditions, and the health of your crop each day.',
    aUr: 'فصل ڈائری آپ کو اپنی تمام زرعی سرگرمیوں کا روزانہ ریکارڈ رکھنے دیتی ہے — بوائی، سینچائی، سپرے، کھاد ڈالنا اور کٹائی۔ آپ ہر روز نوٹس، موسمی حالات اور فصل کی صحت کا اندراج کر سکتے ہیں۔',
  },
  {
    cat: 'features',
    q:   'Can I download my expense report as PDF?',
    qUr: 'کیا میں اپنی اخراجات کی رپورٹ پی ڈی ایف کے طور پر ڈاؤنلوڈ کر سکتا ہوں؟',
    a:   'Yes. In the Expense Tracker, after recording your income and expenses for a season, you can download a complete Profit and Loss report as a PDF. This is useful for bank loan applications and record keeping.',
    aUr: 'جی ہاں۔ اخراجات ٹریکر میں، ایک سیزن کی آمدن اور اخراجات ریکارڈ کرنے کے بعد آپ مکمل منافع اور نقصان کی رپورٹ پی ڈی ایف کے طور پر ڈاؤنلوڈ کر سکتے ہیں۔ یہ بینک قرض کی درخواستوں اور ریکارڈ رکھنے کے لیے مفید ہے۔',
  },
  {
    cat: 'support',
    q:   'How can I contact KisanAI support?',
    qUr: 'کسان اے آئی سپورٹ سے کیسے رابطہ کریں؟',
    a:   'You can contact us through the AI chatbot inside the app. For technical issues, use the feedback option in Settings. We aim to respond within 24 hours.',
    aUr: 'آپ ایپ کے اندر اے آئی چیٹ بوٹ کے ذریعے ہم سے رابطہ کر سکتے ہیں۔ تکنیکی مسائل کے لیے ترتیبات میں فیڈبیک آپشن استعمال کریں۔ ہم ۲۴ گھنٹوں کے اندر جواب دینے کی کوشش کرتے ہیں۔',
  },
  {
    cat: 'support',
    q:   'Why is the app slow on my phone?',
    qUr: 'میرے فون پر ایپ سست کیوں ہے؟',
    a:   'KisanAI is optimized for all phones including budget Android devices. If the app feels slow, try using a WiFi connection instead of mobile data, clear your browser cache, or restart your browser. The app also works offline for most features once loaded.',
    aUr: 'کسان اے آئی تمام فونز بشمول بجٹ اینڈرائیڈ آلات کے لیے بہتر بنائی گئی ہے۔ اگر ایپ سست لگے تو موبائل ڈیٹا کی بجائے وائی فائی استعمال کرنے کی کوشش کریں، براؤزر کیش صاف کریں یا براؤزر دوبارہ شروع کریں۔ ایک بار لوڈ ہونے کے بعد ایپ زیادہ تر خصوصیات کے لیے بغیر انٹرنیٹ کے بھی کام کرتی ہے۔',
  },
]

const CATS = [
  { key:'all',      en:'All',        ur:'سب'          },
  { key:'general',  en:'General',    ur:'عام'          },
  { key:'disease',  en:'Disease',    ur:'بیماری'       },
  { key:'mandi',    en:'Mandi',      ur:'منڈی'         },
  { key:'weather',  en:'Weather',    ur:'موسم'         },
  { key:'ai',       en:'AI & Chat',  ur:'اے آئی'       },
  { key:'account',  en:'Account',    ur:'اکاؤنٹ'       },
  { key:'features', en:'Features',   ur:'خصوصیات'      },
  { key:'support',  en:'Support',    ur:'مدد'          },
]

export default function FAQ() {
  const { i18n } = useTranslation()
  const ur = i18n.language === 'ur'

  const [cat,    setCat]    = useState('all')
  const [open,   setOpen]   = useState(null)
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter(f => {
    const matchCat    = cat === 'all' || f.cat === cat
    const q           = ur ? f.qUr : f.q
    const a           = ur ? f.aUr : f.a
    const matchSearch = !search.trim() ||
      q.toLowerCase().includes(search.toLowerCase()) ||
      a.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', fontFamily:"'Nunito',system-ui,sans-serif", paddingBottom:90 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(155deg,#0D2518,#1A3D28,#26694A)', borderRadius:'0 0 28px 28px', padding:'52px 18px 24px', boxShadow:'0 8px 28px rgba(13,37,24,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>❓</div>
          <div>
            <div style={{ color:'white', fontWeight:900, fontSize:18 }}>
              {ur ? 'اکثر پوچھے گئے سوالات' : 'FAQ'}
            </div>
            <div style={{ color:'#74C69D', fontSize:12, marginTop:2 }}>
              {ur ? `${FAQS.length} سوالات و جوابات` : `${FAQS.length} Questions & Answers`}
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={ur ? '🔍 سوال تلاش کریں...' : '🔍 Search a question...'}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(null) }}
          style={{ width:'100%', padding:'12px 16px', borderRadius:14, border:'none', fontSize:14, fontFamily:'inherit', outline:'none', background:'rgba(255,255,255,0.93)', boxSizing:'border-box', color:'#1A3D28' }}
        />
      </div>

      <div style={{ padding:'16px' }}>

        {/* Category Pills */}
        <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:4, marginBottom:16, scrollbarWidth:'none' }}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => { setCat(c.key); setOpen(null) }} style={{
              padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:700, whiteSpace:'nowrap', fontFamily:'inherit',
              background: cat===c.key ? '#1A3D28' : 'white',
              color:      cat===c.key ? 'white'   : '#1A3D28',
              boxShadow:  cat===c.key ? '0 2px 8px rgba(26,61,40,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
              border:     cat===c.key ? 'none' : '1px solid #DCF0DC',
              transition: 'all 0.15s',
            }}>
              {ur ? c.ur : c.en}
            </button>
          ))}
        </div>

        {/* Result count */}
        {search && (
          <div style={{ fontSize:12, color:'#888', marginBottom:12, fontWeight:600 }}>
            {filtered.length} {ur ? 'نتائج ملے' : 'results found'}
          </div>
        )}

        {/* FAQ List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px', background:'white', borderRadius:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A3D28', marginBottom:6 }}>
              {ur ? 'کوئی نتیجہ نہیں ملا' : 'No results found'}
            </div>
            <div style={{ fontSize:13, color:'#888' }}>
              {ur ? 'مختلف الفاظ سے تلاش کریں' : 'Try searching with different words'}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map((f, i) => {
              const isOpen = open === i
              const q = ur ? f.qUr : f.q
              const a = ur ? f.aUr : f.a
              return (
                <div key={i} style={{ background:'white', borderRadius:18, overflow:'hidden', border:'1px solid #DCF0DC', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.2s' }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    style={{ width:'100%', padding:'16px 18px', background:'transparent', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, fontFamily:'inherit', textAlign: ur ? 'right' : 'left' }}
                  >
                    <div style={{ flex:1, fontSize:14, fontWeight:700, color:'#1A3D28', lineHeight:1.45, textAlign: ur ? 'right' : 'left' }}>
                      {q}
                    </div>
                    <div style={{
                      width:28, height:28, borderRadius:'50%', flexShrink:0,
                      background: isOpen ? '#1A3D28' : '#F0F7F0',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, color: isOpen ? 'white' : '#1A3D28',
                      transition:'all 0.2s',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}>⌄</div>
                  </button>

                  {isOpen && (
                    <div style={{ padding:'0 18px 18px', borderTop:'1px solid #F0F7F0' }}>
                      <div style={{ height:8 }} />
                      <div style={{ fontSize:13, color:'#4A6741', lineHeight:1.85, fontWeight:500, textAlign: ur ? 'right' : 'left' }}>
                        {a}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Still have questions */}
        <div style={{ background:'linear-gradient(135deg,#1A3D28,#256B40)', borderRadius:20, padding:'20px 18px', marginTop:20, textAlign:'center', boxShadow:'0 4px 16px rgba(26,61,40,0.3)' }}>
          <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
          <div style={{ color:'white', fontWeight:800, fontSize:15, marginBottom:6 }}>
            {ur ? 'اور سوال ہے؟' : 'Still have a question?'}
          </div>
          <div style={{ color:'#74C69D', fontSize:12, marginBottom:16, lineHeight:1.6 }}>
            {ur ? 'ہمارا اے آئی چیٹ بوٹ ہر سوال کا جواب دے گا' : 'Our AI chatbot will answer any farming question'}
          </div>
          <a href="/chat" style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', color:'white', padding:'11px 24px', borderRadius:14, fontWeight:700, fontSize:13, textDecoration:'none', fontFamily:'inherit' }}>
            🤖 {ur ? 'اے آئی سے پوچھیں' : 'Ask AI Chatbot'}
          </a>
        </div>
      </div>
    </div>
  )
}