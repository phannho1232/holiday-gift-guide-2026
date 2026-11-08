/* =============================================
   The Curated Living — Tracking & Affiliate System
   15 Verified Christmas Gift Brands on Impact.com
   ============================================= */
(function(){
'use strict';

/* ── CONFIG — Replace affiliateLinks with your approved Impact.com tracking URLs ── */
var CONFIG={
  pixelId:'', /* Set your 15-digit Facebook Pixel ID here, e.g. '123456789012345' */
  cutoffMonth:11, /* 0-indexed: 11 = December */
  cutoffDay:15,   /* Dec 15+: automatically prioritize instant eVouchers */
  affiliateLinks:{
    cozyearth:'',
    auraframes:'',
    storyworth:'',
    boarderie:'',
    tinggly:'',
    pura:'',
    levain:'',
    harryanddavid:'',
    bearaby:'',
    ourplace:'',
    solostove:'',
    breville:'',
    vosges:'',
    tradecoffee:'',
    masterclass:''
  },
  brandUrls:{
    cozyearth:'https://cozyearth.com/collections/womens-sleepwear',
    auraframes:'https://auraframes.com/digital-frames/carver-mat',
    storyworth:'https://welcome.storyworth.com/',
    boarderie:'https://www.boarderie.com/collections/holiday-cheese-and-charcuterie-boards',
    tinggly:'https://www.tinggly.com/gift-boxes',
    pura:'https://pura.com/collections/gift-sets',
    levain:'https://levainbakery.com/collections/holiday-gifts',
    harryanddavid:'https://www.harryanddavid.com/h/gift-baskets-tower-boxes',
    bearaby:'https://bearaby.com/products/the-napper',
    ourplace:'https://fromourplace.com/collections/sets',
    solostove:'https://www.solostove.com/en-us/p/bonfire-plus-stand',
    breville:'https://www.breville.com/en-us/product/bes876',
    vosges:'https://www.vosgeschocolate.com/collections/holiday-chocolate-gifts',
    tradecoffee:'https://www.drinktrade.com/gift-subscription',
    masterclass:'https://www.masterclass.com/gift'
  }
};

/* ── Initialize FB Pixel only when a valid numeric Pixel ID is configured ── */
if(CONFIG.pixelId && /^\d{10,20}$/.test(CONFIG.pixelId)){
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init',CONFIG.pixelId);
  window.fbq('track','PageView');
}

/* ── UTM & Click ID Parser ── */
var UTM={};
var sp=new URLSearchParams(window.location.search);
['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid'].forEach(function(k){
  var v=sp.get(k)||sessionStorage.getItem('tcl_'+k)||'';
  if(v){UTM[k]=v;sessionStorage.setItem('tcl_'+k,v);}
});
if(!sessionStorage.getItem('tcl_sid')){
  sessionStorage.setItem('tcl_sid',Date.now().toString(36)+Math.random().toString(36).substring(2,7));
}
UTM._sid=sessionStorage.getItem('tcl_sid');

/* ── Sub ID & Outbound URL Builder ── */
function buildUrl(brand,pos){
  var base=(CONFIG.affiliateLinks[brand]&&CONFIG.affiliateLinks[brand].indexOf('PUBLISHER_ID')===-1)
    ? CONFIG.affiliateLinks[brand]
    : (CONFIG.brandUrls[brand]||'https://www.google.com');
  var sep=base.indexOf('?')>-1?'&':'?';
  return base+sep+[
    'utm_source='+encodeURIComponent(UTM.utm_source||'thecuratedliving'),
    'utm_medium=affiliate',
    'utm_campaign='+encodeURIComponent(UTM.utm_campaign||'xmas2026'),
    'subId1='+encodeURIComponent(UTM.utm_source||'direct'),
    'subId2='+encodeURIComponent(UTM.utm_campaign||'xmas2026'),
    'subId3='+encodeURIComponent(UTM.utm_content||'guide'),
    'subId4='+encodeURIComponent(UTM.fbclid||UTM.gclid||UTM._sid),
    'subId5='+encodeURIComponent(pos||brand)
  ].join('&');
}
window.buildAffiliateUrl=buildUrl;

/* ── FB Pixel Safe Wrapper ── */
function px(ev,p){
  if(typeof window.fbq==='function'){
    try{window.fbq('track',ev,p||{});}catch(err){}
  }
}

/* ── Clipboard Helper with Fallback ── */
function copyToClipboard(text){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).catch(function(){});
  }
  try{
    var ta=document.createElement('textarea');
    ta.value=text;
    ta.style.position='fixed';
    ta.style.opacity='0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }catch(e){}
  return Promise.resolve();
}

/* ── Product View Tracking ── */
var seen={};
if('IntersectionObserver' in window){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var id=e.target.dataset.productId;
      if(e.isIntersecting&&id&&!seen[id]){
        seen[id]=true;
        px('ViewContent',{
          content_ids:[id],
          content_name:e.target.dataset.productName||id,
          content_type:'product',
          value:parseFloat(e.target.dataset.productPrice)||0,
          currency:'USD'
        });
      }
    });
  },{threshold:0.35});
  document.querySelectorAll('[data-product-id]').forEach(function(el){obs.observe(el);});
}

/* ── Scroll Depth Tracking ── */
var sf={};
window.addEventListener('scroll',function(){
  var docH=document.documentElement.scrollHeight-window.innerHeight;
  if(docH<=0)return;
  var pct=Math.round(window.scrollY/docH*100);
  [25,50,75,100].forEach(function(m){
    if(pct>=m&&!sf[m]){
      sf[m]=true;
      if(m>=75)px('CustomizeProduct',{content_category:'scroll_'+m});
    }
  });
},{passive:true});

/* ── Outbound Click Handler (copy code + open brand site + track) ── */
window.goShop=function(brand,code,btn){
  var pos=btn&&btn.dataset&&btn.dataset.pos?btn.dataset.pos:(brand+'_cta');
  var url=buildUrl(brand,pos);
  var card=btn?btn.closest('[data-product-id]'):null;
  var price=card?parseFloat(card.dataset.productPrice)||0:0;

  px('Lead',{content_ids:[brand],content_name:brand,value:price,currency:'USD'});
  px('AddToCart',{content_ids:[brand],content_type:'product',value:price,currency:'USD'});

  if(code)copyToClipboard(code);
  window.open(url,'_blank','noopener,noreferrer');

  if(btn){
    var orig=btn.dataset.origText||btn.textContent;
    btn.dataset.origText=orig;
    btn.textContent=code?('✓ Code '+code+' copied — opening brand…'):'✓ Opening brand site…';
    setTimeout(function(){btn.textContent=orig;},3000);
  }
};

/* ── Promo Code Copy Button ── */
window.copyCode=function(code,el){
  copyToClipboard(code).then(function(){
    if(!el)return;
    var orig=el.dataset.origText||el.textContent;
    el.dataset.origText=orig;
    el.textContent='✓ Copied!';
    setTimeout(function(){el.textContent=orig;},2000);
  });
};

/* ── Automatic Post-Dec-14 eVoucher Priority Mode ── */
function applyLateSeasonPriority(){
  var now=new Date();
  var forceLate=sp.get('late')==='1'||sp.get('evoucher')==='1';
  var isAfterCutoff=(now.getMonth()===CONFIG.cutoffMonth&&now.getDate()>=CONFIG.cutoffDay)||forceLate;
  if(!isAfterCutoff)return;

  var grid=document.getElementById('gifts-grid');
  if(grid){
    var cards=Array.prototype.slice.call(grid.querySelectorAll('.gift-card'));
    cards.sort(function(a,b){
      var aDig=a.dataset.delivery==='digital'?0:1;
      var bDig=b.dataset.delivery==='digital'?0:1;
      return aDig-bDig;
    });
    cards.forEach(function(c){grid.appendChild(c);});
  }

  var notice=document.getElementById('shipping-cutoff-alert');
  if(notice)notice.hidden=false;
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',applyLateSeasonPriority);
}else{
  applyLateSeasonPriority();
}

})();
