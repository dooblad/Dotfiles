// Extension for Chrome Browser - Magic Actions for YouTube™ - CHROMEACTIONS.COM - Copyright 2016 Vlad and Serge Strukoff - All Rights Reserved
window.addEventListener("load",ccMenu,!1);
function ccMenu(){function w(){"menu1"==this.id&&d("ctrb.html")}function x(b){var c=b.target.id?b.target:b.target.parentElement,a=c.id;"menu0"==u&&(a=parseInt(c.id.slice(1)),0==a?d("http://www.chromeactions.com/magic-actions-for-youtube-support.html",1):1==a?d("http://www.chromeactions.com/magic-actions-for-youtube-help-and-tips.html",1):2==a?chrome.runtime.sendMessage('{"id":7}'):3==a?d("chrome://plugins"):4==a?d("http://www.youtube.com/my_history"):5==a?d("chrome://extensions"):6==a?d("http://www.hotcleaner.com/clickclean-app.html",
1):7==a?d("https://www.facebook.com/magicactions"):8==a?d("http://www.youtube.com/user/StrukoffBrothers/feed"):9==a?d("https://plus.google.com/110367533603365326399/posts"):10==a&&d("https://chrome.google.com/webstore/detail/magic-actions-for-youtube/abjcfabbhafbcdfjoecdgepllmpfceif/reviews"));b.stopPropagation()}function y(){var b=c("rng"),v=c("amnt"),a=c("paypal"),h=c("bitpay"),f=c("ppPrice");e_price2=c("bpPrice");a.setAttribute("action","https://www.paypal.com/cgi-bin/webscr");h.setAttribute("action",
"https://bitpay.com/checkout");c("ppItemName").value=c("bpItemDesc").value="Donation for Magic Actions - Chrome Edition";c("ppBusiness").value="webmaster@mixesoft.com";c("bpData").value="QssHQDbRWfw8q4ZrIXbQo39IRne2n99dmkMZHZ5U30pSjGO7mKX1oewbiLiSkZZ/mGmWzLvaYuMrDax7AZNkZg/3mLE2npzjwC0mUH+rwp+cScWvicGSP0ZnXXiAsFjClAJtBZ5C3Y5NgMS3TM4AUP+5v7WRXGDnMsNdxjuPIYao/vi8ici0swhr4lXPpmZAehzTcDKd5jqiCm1cx0Fjd/orQchtC44wHDamnN/JVpLQrLuZahb8NP10wkQXo7sefDInqAmVgSjNpaOGjcpd2g==";v.textContent="$ "+b.value;b.addEventListener("change",
function(a){v.textContent="$ "+b.value;f.value=e_price2.value=b.value;a.stopPropagation()},!1);a.addEventListener("submit",function(){var a=f.value;return isNaN(a)||2>a||30<a?!1:!0},!1);h.addEventListener("submit",function(){var a=e_price2.value;return isNaN(a)||2>a||30<a?!1:!0},!1)}function d(b,c){c?chrome.windows.create({url:b,left:0,top:0,width:screen.width,height:screen.height,incognito:!0,focused:!0}):chrome.tabs.create({url:b})}function c(b){return document.getElementById(b)}var u="menu0";(function(){var b=
chrome.i18n.getMessage("menu").split(";"),d=document.createDocumentFragment(),a=c("menu"),h;a.id="menu";for(var f=0;f<b.length;f++)h=document.createElement("div"),h.className="nav",h.id="menu"+f,h.textContent=b[f],h.addEventListener("click",w,!1),d.appendChild(h);a.appendChild(d);c(u).className="nav act";a:{var a=u,g,b=c("box");if("menu0"==a)g=[3,"orange","report.png",0,7,0,"help1.png",1,3,"blue","options.png",2,3,"violet","plugins.png",3,3,"violet","history.png",4,3,"violet","extensions.png",5,3,
"violet","security.png",6,0,"fb","facebook32.png",7,0,"yt","youtube32.png",8,0,"gp","gplus32.png",9,0,"rt","rate32.png",10];else if("menu1"==a){g=c("donate");if(!g.hasAttribute("init")){for(var k=chrome.i18n.getMessage(a).split(";"),l=g.innerHTML,d=0,s;s=k[d];d++)l=l.replace("t"+(10+d),s);g.innerHTML=l;g.setAttribute("init",!0);y()}b.style.display="none";g.style.display="block";break a}d=0;a=chrome.i18n.getMessage(a).split(";");h=document.createDocumentFragment();for(var m,n,e,p,r,t,q=0;q<g.length;q+=
4)f=q/4,n=g[q],p=g[q+1],r=g[q+2],2==n?(e=new Uint8Array(1),crypto.getRandomValues(e),e=e[0]%p.length,f="i"+(f+e),p=p[e],r="i/menu/"+r[e],t=a[g[q+3]+e]):(f="i"+f,r="i/menu/"+r,t=a[g[q+3]]),7>n?(s=0,m=document.createElement("div"),k=document.createElement("div"),l=document.createElement("div"),e=new Image,p="btn "+p,2<n?(p+=" wide",m.className="btnBoxWide"):m.className="btnBox",k.id=f,k.className=p,e.className="icn",l.className="txt0",e.dataset.url=e.src=r,l.textContent=t,k.appendChild(e),k.appendChild(l),
m.appendChild(k),h.appendChild(m)):(n=document.createElement("div"),m=document.createElement("div"),e=new Image,e.src=r,n.id=f,n.className="adt a"+s,e.className="icnm",m.className="txt1",m.textContent=t,n.appendChild(e),k.insertBefore(n,l),k.insertBefore(m,l),s++),d++;b.innerHTML="";b.appendChild(h);b.style.display="";c("donate").style.display=""}c("box").addEventListener("click",x,!1);chrome.runtime.sendMessage('{"id":1,"ga":{"ea":"menu"}}')})()};