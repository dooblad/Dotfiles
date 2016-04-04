// Extension for Chrome Browser - Magic Actions for YouTube™ - CHROMEACTIONS.COM - Copyright 2016 Vlad and Serge Strukoff - All Rights Reserved
window.addEventListener("load",magicOpt,!1);
function magicOpt(){function z(f){t=document.referrer&&0==document.referrer.indexOf("https")?"https:":"http:";f&&(F(f.url),a=f.opt);f=document.createDocumentFragment();var b,k=t+"//www.chromeactions.com/magic-actions-for-youtube-";b=g("ul");b.id="opt";f.appendChild(b);if(0<a.nv){var r=chrome.i18n.getMessage("m1",[G,a.ver]);v(b,r);setTimeout(function(){window.top.postMessage(r,t+"//www.chromeactions.com")},1500);n("nv",0)}v(b,'YouTube constantly make changes, and we constantly need to make sure we are in sync. Last years we have been working hard to provide you with the best possible features.<br>Due to the very, very small number of donations the project may be closed.<br>If you like our app, please support further development with a <u class="help">Donation \u2026</u>',!1,
!0);d(b,"mwvc",c("o8"),a.mwvc,0,0,k+"volume-control.html");H(b);I(b);J(b);K(b,"gap",c("o27"),a.gap,1,25,1,!a.mwvc);d(b,"hq",c("o90"),a.hq,0,0,k+"autohd.html");L(b);d(b,"ha",c("o20"),a.ha);d(b,"mrl",c("o44"),a.mrl);d(b,"wide",c("o28"),a.wide);d(b,"ww",c("o80"),a.ww);d(b,"cin",c("o29"),a.cin,0,0,k+"cinema.html");M(b);d(b,"cina",c("o30"),a.cina,1,!a.cin);d(b,"cinf",c("o31"),a.cinf,1,!a.cin);d(b,"pt",c("o65"),a.pt);pti=a.pti;N(b);d(b,"pause",c("o17"),a.pause);d(b,"plist",c("o19"),a.plist,1,!a.pause);
d(b,"buf",c("o18"),a.buf);d(b,"buf1",c("o63"),a.buf1,1,!a.buf);d(b,"loop",c("o40"),a.loop);d(b,"hide",c("o41"),a.hide);d(b,"c0",c("o70"),a.c0,0,0,k+"comments.html");w(b,["c1",c("o71"),a.c1,"c4",c("o86"),a.c4,"c3",c("o73"),!1],!a.c0);d(b,"anns",c("o42"),a.anns);d(b,"f0",c("o43"),a.f0);d(b,"h0",c("o50"),a.h0);w(b,["h7",c("o56"),a.h7,"h1",c("o51"),a.h1,"h2",c("o52"),a.h2,"h3",c("o53"),a.h3,"h4",c("o54"),a.h4],!a.h0);w(b,["h5",c("o55"),a.h5,"h6",c("o64"),a.h6,"h8",c("o57"),a.h8],!a.h0);d(b,"a0",c("o60"),
a.a0,0,0,k+"themes.html");d(b,"a4",c("o81"),a.a4,1,!a.a0);d(b,"a1",c("o61"),a.a1,1,!a.a0);d(b,"a2",c("o62"),a.a2,1,!a.a0);d(b,"a3",c("o84"),a.a3,1,!a.a0);d(b,"a5",c("o85"),a.a5,1,!a.a0);O(b);document.body.appendChild(f);document.getElementById("f0").parentElement.title="Show/Hide the Filters button so you can apply a filter (grayscale, flip, high contrast etc.) to any video";A("a5");A("mrl");document.getElementById("mrl").parentElement.title="Show/Hide the Filters button so you can apply a filter (grayscale, flip, high contrast etc.) to any video"}
function n(a,b){chrome.runtime.sendMessage(JSON.stringify({id:4,name:a,value:b}))}function A(a){var b=g("sup");b.textContent=c("m4");b.style.color="red";b.style.verticalAlign="top";document.getElementById(a).nextElementSibling.appendChild(b)}function P(f){document.getElementById(a.color).className="";a.color=this.id;this.className="sel";n("color",a.color)}function B(f){document.getElementById("vt"+a.mwvct).checked=!1;a.mwvct=parseInt(this.id.charAt(2));this.checked=!0;n("mwvct",a.mwvct)}function x(f){document.getElementById("vc"+
a.mwvci).checked=!1;a.mwvci=parseInt(this.id.charAt(2));this.checked=!0;n("mwvci",a.mwvci)}function y(f){document.getElementById("ca"+a.cini).checked=!1;a.cini=parseInt(this.id.charAt(2));this.checked=!0;n("cini",a.cini)}function C(f){document.getElementById("pt"+a.pti).checked=!1;a.pti=parseInt(this.id.charAt(2));this.checked=!0;n("pti",a.pti)}function h(f){document.getElementById(a.hqi).checked=!1;a.hqi=this.id;this.checked=!0;n("hqi",a.hqi)}function D(f){if("c3"==this.id)this.checked=!1,this.disabled=
!0,v(document.body,'<b>Note:</b> The Country Flags feature was disabled due to the YouTube <a target="_blank" href="https://developers.google.com/youtube/youtube-api-list">deprecation policy</a>.<br>The YouTube API v2 would be retired in April 20, 2015, and would be shut down soon thereafter.',!0);else if(a[this.id]=this.checked,n(this.id,this.checked),f=this.parentElement,"opt"==f.className)for(f=f.nextElementSibling;f&&("sub"==f.className||"sub multi"==f.className);)f.setAttribute("disabled",!this.checked),
f=f.nextElementSibling}function Q(f){a[f.id]=parseInt(f.value);n(f.id,parseInt(f.value))}function R(a){u&&(clearTimeout(u),u=0);this.nextElementSibling.textContent=this.value;u=setTimeout(Q,1E3,this)}function I(f){var b,k,r="red LightPink orange lime GreenYellow yellow gold DodgerBlue aqua magenta DeepPink white".split(" "),l=g("li");b=g("label");l.className="sub";l.setAttribute("disabled",!a.mwvc);l.id="color";b.textContent=c("o9");l.appendChild(b);for(var d=0,e=r.length;d<e;d++)k=r[d],b=g("button"),
b.id=k,b.style.backgroundColor=k,a.color==k&&(b.className="sel"),l.appendChild(b),b.addEventListener("click",P,!1);f.appendChild(l)}function H(f){var b=g("li");b.id="mwvct";b.className="sub";b.setAttribute("disabled",!a.mwvc);e(b,"vt0",c("o82"),0==a.mwvct,B);e(b,"vt1",c("o83"),1==a.mwvct,B);f.appendChild(b)}function J(f){var b=g("li"),k=g("label");b.id="mwvci";b.className="sub";b.setAttribute("disabled",!a.mwvc);k.textContent=c("o23");b.appendChild(k);e(b,"vc1",c("o24"),1==a.mwvci,x);e(b,"vc2",c("o25"),
2==a.mwvci,x);e(b,"vc0",c("o26"),0==a.mwvci,x);f.appendChild(b)}function M(f){var b=g("li"),k=g("label");b.id="cini";b.className="sub";b.setAttribute("disabled",!a.cin);k.textContent=c("o32");b.appendChild(k);e(b,"ca0",c("o33"),0==a.cini,y);e(b,"ca1",c("o34"),1==a.cini,y);e(b,"ca2",c("o35"),2==a.cini,y);f.appendChild(b)}function N(f){var b=g("li");b.id="pti";b.className="sub";b.setAttribute("disabled",!a.pt);e(b,"pt0",c("o66"),0==a.pti,C);e(b,"pt1",c("o67"),1==a.pti,C);f.appendChild(b)}function e(a,
b,c,r,l){var d=g("label"),e=g("input");e.type="radio";e.id=b;r&&(e.checked=!0);a.appendChild(e);d.textContent=c;d.setAttribute("for",b);a.appendChild(d);e.addEventListener("click",l,!1)}function L(f){var b=g("li");b.id="hqi";b.className="sub";b.setAttribute("disabled",!a.hq);e(b,"highres",c("o91"),"highres"==a.hqi,h);e(b,"hd2880",c("o92"),"hd2880"==a.hqi,h);e(b,"hd2160",c("o93"),"hd2160"==a.hqi,h);e(b,"hd1440",c("o94"),"hd1440"==a.hqi,h);e(b,"hd1080",c("o95"),"hd1080"==a.hqi,h);e(b,"hd720",c("o96"),
"hd720"==a.hqi,h);e(b,"large",c("o97"),"large"==a.hqi,h);e(b,"medium",c("o98"),"medium"==a.hqi,h);e(b,"small",c("o99"),"small"==a.hqi,h);e(b,"tiny",c("o100"),"tiny"==a.hqi,h);f.appendChild(b)}function d(a,b,c,d,l,e,E){var p=g("li"),h=g("label"),m=g("input");h.textContent=c;h.setAttribute("for",b);m.type="checkbox";m.id=b;m.checked=d;p.appendChild(m);p.appendChild(h);l?(p.className="sub",p.setAttribute("disabled",e)):p.className="opt";E&&(b=g("a"),b.textContent="\u2026",b.title="About",b.href=E,b.setAttribute("target",
"_blank"),b.className="help",p.appendChild(b));a.appendChild(p);m.addEventListener("click",D,!1)}function w(a,b,c){for(var d=g("li"),l,e,h=0,p=b.length;h<p;h+=3)l=g("label"),e=g("input"),l.textContent=b[h+1],l.setAttribute("for",b[h]),e.type="checkbox",e.id=b[h],e.checked=b[h+2],d.appendChild(e),d.appendChild(l),e.addEventListener("click",D,!1);d.className="sub multi";d.setAttribute("disabled",c);a.appendChild(d)}function K(a,b,c,d,e,h,n,p){var s=g("li"),m=g("label"),q=g("input");m.textContent=c;
m.setAttribute("for",b);q.type="range";q.min=e;q.max=h;q.step=n;q.value=d;q.id=b;q.title="Range: "+e+"-"+h;s.appendChild(m);s.appendChild(q);m=g("span");m.textContent=d;s.appendChild(m);s.className="sub";s.setAttribute("disabled",p);a.appendChild(s);q.addEventListener("change",R,!1)}function O(a){var b=g("li"),c=g("a");b.className="opt";c.textContent="Export Options \u2026";c.className="btn";c.addEventListener("click",S,!1);b.appendChild(c);c=g("a");c.textContent="Import Options \u2026";c.className=
"btn";c.addEventListener("click",T,!1);b.appendChild(c);a.appendChild(b)}function v(a,b,c,d){var e=g("ul"==a.localName?"li":"div");e.className="msg"+(c?" fixed":"");e.innerHTML=b;a.appendChild(e);d&&(e.style.backgroundImage="none",e.style.backgroundColor="#eee");e.addEventListener("click",d?U:V,!1)}function U(a){chrome.runtime.sendMessage(JSON.stringify({id:2,url:"ctrb.html"}));a.stopPropagation()}function V(a){this.parentElement.removeChild(this);a.stopPropagation()}function F(a){0!=a.indexOf(t+
"//www.chromeactions.com/")&&0!=a.indexOf(chrome.runtime.getURL(""))&&(document.location.href="about:blank")}function S(){var c,b=JSON.stringify(a);Blob?c=new Blob([b],{type:"application/json;charset=UTF-8"}):BlobBuilder&&(c=new BlobBuilder,c.append(b),c=c.getBlob("application/json;charset=UTF-8"));W(c,"MagicActions-Options.json")}function T(){X(1E5,function(c){try{c=JSON.parse(c)}catch(b){return}var d=a.ver,e=a.nv,g;for(g in c)void 0!=a[g]&&(a[g]=c[g]);a.ver=d;a.nv=e;chrome.runtime.sendMessage(JSON.stringify({id:3,
opt:a}));document.body.innerHTML="";z()})}function X(a,b){var c=document.getElementById("openAs");c&&document.body.removeChild(c);c=document.createElement("input");c.id="openAs";c.style.display="none";c.type="file";document.body.appendChild(c);c.addEventListener("change",function(c){if((c=c.target.files)&&1==c.length&&c[0].size<a){var d=new FileReader;d.onload=function(a){b(a.target.result)};d.readAsText(c[0])}else showMsg("m12",1E3)},!1);c.click()}function W(a,b){var c=document.createElement("a"),
d=window.URL||window.webkitURL;c.href=d.createObjectURL(a);c.setAttribute("download",b);c.click();setTimeout(function(){d.revokeObjectURL(c.href)},2E3)}function g(a){return document.createElement(a)}function c(a){return chrome.i18n.getMessage(a)}if(chrome.tabs&&window.location.search!="?s=689"+(new Date).getDate())window.location.href="options.html";else{var a,u=0,G=chrome.i18n.getMessage("extName"),t="http:";chrome.runtime.sendMessage('{"id":0}',z)}};