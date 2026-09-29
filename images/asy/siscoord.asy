import three;
import graph3;

settings.tex="pdflatex";
// settings.texpath="C:\texlive\2026\bin\windows";
// settings.dvips="C:\texlive\2026\bin\windows\dvips.exe";
// settings.dvisvgm="C:\texlive\2026\bin\windows\dvisvgm.exe";
// settings.gs="C:\Program Files\gs\gs10.07.0\bin\gswin64c.exe";
// settings.convert="C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe";
// settings.outformat="html";
settings.antialias=2;
settings.render=16;
// settings.prc=true;
// settings.keys=true;
// settings.offline=true;

real rho = 2;

triple circl(real t) {
  return (rho*cos(t), rho*sin(t), 0);
}

// Frenet-Serret
triple st(real t) {return (sin(t), -cos(t), 0);}

triple xt(real t) {return (cos(t), sin(t), 0);}

triple yt(real t) {return (0, 0, 1);}

// eletron
real R=0.07;
real a=2*R/sqrt(2);

real Amp = -0.8;
triple fx(real t){return xt(t)*Amp/1.7*cos(1.2*t);}
triple fy(real t){return yt(t)*(Amp+0.15)*cos(1.2*t);}

// animation a;

real theta = 0;
triple point = (0, 0, 0);
triple pe = (0, 0, 0);
triple Oos = (0, 0, 0);
triple Oox = (0, 0, 0);
triple Ooy = (0, 0, 0);

real global_scale = 0.2;
size(1600*global_scale, 900*global_scale);

draw(graph(circl, 0, 2pi), black);

theta = 0.9pi;
point = circl(theta);
Oos = point+st(theta);
Oox = point+xt(theta);
Ooy = point+yt(theta);

draw((0,0,0) -- point, gray);
draw(point -- Oos, Arrow3);
draw(point -- Oox, Arrow3);
draw(point -- Ooy, Arrow3);

label("$\vec{r}_0$", point/2, S, gray);
label("$\hat{s}$", Oos, S);
label("$\hat{x}$", Oox, E);
label("$\hat{y}$", Ooy, N);

draw(point -- Oox, Arrow3(dashed+gray));
draw(point -- Ooy, Arrow3(dashed+gray));

pe = point + fx(theta) + fy(theta);
//label("particle", pe, N, red);
draw((point.x, point.y, pe.z) -- pe, gray+dashed);
draw((pe.x, pe.y, point.z) -- pe, gray+dashed);
draw(pe -- pe + st(theta)*0.6, Arrow3(red));
label("{\small $\vec{v}$}", pe + st(theta)*0.6, NE, red);

real sez = 0.05;
draw(shift(pe)*scale(sez,sez,sez)*unitsphere, red);

