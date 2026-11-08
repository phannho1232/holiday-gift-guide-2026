/* =============================================
   The Curated Living — Tracking & Affiliate System
   ============================================= */
(function(){
'use strict';

/* ── CONFIG — Update with real values ── */
var CONFIG={
  pixelId:'YOUR_PIXEL_ID',
  links:{
    boarderie:'https://boarderie.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    storyworth:'https://storyworth.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    cozyearth:'https://cozyearth.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    revomadic:'https://revomadic.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    tinggly:'https://tinggly.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    bluetti:'https://bluetti.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID',
    jmgo:'https://jmgo.sjv.io/c/PUBLISHER_ID/CAMPAIGN_ID/PROGRAM_ID'
  }
};

/* ── UTM Parser ── */
var UTM={};
var sp=new URLSearchParams(window.location.search);
['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid'].forEach(function(k){
  var v=sp.get(k)||sessionStorage.getItem('tcl_'+k)||'';
  if(v){UTM[k]=v;sessionStorage.setItem('tcl_'+k,v)}
});
if(!sessionStorage.getItem('tcl_sid'))sessionStorage.setItem('tcl_sid',Date.now().toString(36)+Math.random().toString(36).substr(2,5));
UTM._sid=sessionStorage.getItem('tcl_sid');

/* ── Sub ID Builder ──
   subId1=utm_source  subId2=utm_campaign  subId3=utm_content
   subId4=fbclid (CAPI matching)  subId5=click_position */
function buildUrl(brand,pos){
  var base=CONFIG.links[brand]||'#';
  var sep=base.indexOf('?')>-1?'&':'?';
  return base+sep+[
    'subId1='+encodeURIComponent(UTM.utm_source||'direct'),
    'subId2='+encodeURIComponent(UTM.utm_campaign||'none'),
    'subId3='+encodeURIComponent(UTM.utm_content||'none'),
    'subId4='+encodeURIComponent(UTM.fbclid||UTM.gclid||UTM._sid),
    'subId5='+encodeURIComponent(pos||brand)
  ].join('&');
}

/* ── FB Pixel Helper ── */
function px(ev,p){if(typeof fbq!=='undefined')fbq('track',ev,p)}

/* ── Product View Tracking ── */
var seen={};
if('IntersectionObserver' in window){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting&&e.target.dataset.productId&&!seen[e.target.dataset.productId]){
        seen[e.target.dataset.productId]=true;
        px('ViewContent',{content_ids:[e.target.dataset.productId],content_name:e.target.dataset.productName||'',content_type:'product',value:parseFloat(e.target.dataset.productPrice)||0,currency:'USD'});
      }
    });
  },{threshold:0.35});
  document.querySelectorAll('[data-product-id]').forEach(function(el){obs.observe(el)});
}

/* ── Scroll Depth ── */
var sf={};
window.addEventListener('scroll',function(){
  var pct=Math.round(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100);
  [25,50,75,100].forEach(function(m){if(pct>=m&&!sf[m]){sf[m]=true;if(m>=75)px('CustomizeProduct',{content_category:'scroll_'+m})}});
},{passive:true});

/* ── Go Shop (copy code + redirect + track) ── */
window.goShop=function(brand,code,btn){
  var url=buildUrl(brand,brand+'_buy');
  px('Lead',{content_ids:[brand],content_name:brand});
  px('AddToCart',{content_ids:[brand],content_type:'product',currency:'USD'});
  navigator.clipboard.writeText(code).catch(function(){});
  window.open(url,'_blank','noopener');
  if(btn){var o=btn.textContent;btn.textContent='\u2713 Code copied \u2014 opening site\u2026';setTimeout(function(){btn.textContent=o},3000)}
};

/* ── Copy Code ── */
window.copyCode=function(code,el){
  navigator.clipboard.writeText(code).then(function(){var o=el.textContent;el.textContent='\u2713 copied!';setTimeout(function(){el.textContent=o},2000)});
};

})();
