import three;
import solids;
import graph3;

settings.tex="pdflatex";
// settings.texpath="C:\texlive\2026\bin\windows";
// settings.dvips="C:\texlive\2026\bin\windows\dvips.exe";
// settings.dvisvgm="C:\texlive\2026\bin\windows\dvisvgm.exe";
// settings.gs="C:\Program Files\gs\gs10.07.0\bin\gswin64c.exe";
// settings.convert="C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe";
settings.outformat="png";
settings.antialias=2;
settings.render=4;
// settings.prc=true;
// settings.keys=true;
// settings.offline=true;

// usepackage("helvet");

real global_scale = 0.7;
size(1600*global_scale, 900*global_scale);
defaultpen(fontsize(30pt));
// defaultpen(fontface("sans serif"));

real R = 1;
int n = 12;
real res = 8.0/n;

void drawquad(pair p, real t, pen k) {
	draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*rotate(0*45, X)*scale(res*0.2/10, res*0.8/10, res*1/10)*shift(-0.5X -0.5Y -0.5Z)*unitcube, k);
}

void drawdip(pair p, real t, pen k) {
	draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*scale(res*1.2/10, res*0.8/10, res*1/10)*shift(-0.5X -0.5Y -0.5Z)*unitcube, k);
}

void drawsext(pair p, real t, pen k) {
	//draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*scale(0.2/10, 0.8/10, 1/10)*shift(-0.5X -0.5Y -0.5Z)*unitcube, heavygreen);
  	real a = 15*pi/180;
  	real siz = 1/17;
    draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*rotate(30, X)*scale(res*siz, res*siz, res*siz)*rotate(90, Y)*rotate(0, Z)*scale(1, 2-sin(a), 0.2)*shift(-0.5X-0.5Y-0.5Z)*unitcube, k);
    
  draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*rotate(30, X)*scale(res*siz, res*siz, res*siz)*rotate(90, Y)*rotate(60, Z)*scale(1, 2-sin(a), 0.2)*shift(-0.5X-0.5Y-0.5Z)*unitcube, k);
  
  draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*rotate(30, X)*scale(res*siz, res*siz, res*siz)*rotate(90, Y)*rotate(2*60, Z)*scale(1, 2-sin(a), 0.2)*shift(-0.5X-0.5Y-0.5Z)*unitcube, k);
}

void drawcavity(triple s, real ang, pen p) {
	//draw(shift(p.x, p.y, 0)*rotate(-t*180/pi, Z)*scale(2/10, 0.8/10, 1/10)*shift(-0.5X -0.5Y -0.5Z)*unitcube, black);
  real siz = 1/17;
  draw(shift(s)*rotate(90 -ang*180/pi, Z)*rotate(90, X)*scale(res*siz, res*siz, res*3*siz)*shift(-0.5Z)*unitcylinder, p);
	draw(shift(s)*rotate(90 -ang*180/pi, Z)*rotate(90, X)*scale(res*siz, res*siz, res*3*siz)*shift(-0.5Z)*unitdisk, p);
	draw(shift(s)*rotate(90 -ang*180/pi, Z)*rotate(90, X)*scale(res*siz, res*siz, res*3*siz)*shift(+0.5Z)*unitdisk, p);
}

pair xyline(pair p1, pair p2, real rate=0.5) {
  return (p2.x*rate + p1.x*(1-rate), p2.y*rate + p1.y*(1-rate));
}

real theta, thetan, r;
pair p, pn;
pen vchambcolor = gray+linewidth(6*global_scale);
pen quadcolor = orange;
pen dipcolor = mediumblue;
pen sextcolor = heavygreen;
pen cavitycolor = lightgray;

for (int i=0; i<n; ++i) {
    theta = i*2pi/n;
    thetan = (i+1)*2pi/n;
    p = (R*sin(theta), R*cos(theta));
    pn = (R*sin(thetan), R*cos(thetan));

    // if (i == n-1) {
    //     // draw((-R/2, R/3) -- xyline(p, pn, 0.8), vchambcolor, Arrow(8*res, Relative(0.5)));
    //   	pair tp = xyline(p, pn, 0.8);
    //   	draw((-R/2, R/3, 0) -- (tp.x, tp.y, 0), SE, vchambcolor, Arrow3(10*res, Relative(0.5)));
    //   	// label("\sffamily\LARGE Beam", (tp.x - R/2, tp.y - R/3, R/8), SE, vchambcolor);
    //   	// label("\sffamily\LARGE Injection", (tp.x - R/2, tp.y - R/3, R/16), SE, vchambcolor);
      
    //     // label(minipage("\centering Beam Injection"), (-R/3.5, 0)+((-R/2, R/3)+xyline(p, pn, 0.8))/2, SE, vchambcolor); 
    // }

    if (i == n-1) {
        //draw((-R/2, R/3) -- xyline(p, pn, 0.8), vchambcolor, Arrow(8*res, Relative(0.5)));
      	pair tp = xyline(p, pn, 0.8);
      	draw("\sffamily\LARGE Beam Injection", (-R/2, R/3, 0) -- (tp.x, tp.y, 0), SE, vchambcolor, Arrow3(10*res, Relative(0.5)));
      	//label("\scriptsize Beam", (tp.x - R/2, tp.y - R/3, R/8), SE, vchambcolor);
      	//label("\scriptsize Injection", (tp.x - R/2, tp.y - R/3, R/16), SE, vchambcolor);
      
        //label(minipage("\centering Beam\\ Injection"), (-R/3.5, 0)+((-R/2, R/3)+xyline(p, pn, 0.8))/2, SE, vchambcolor); 
    }

    //draw(p -- pn, vchambcolor);
  	draw((p.x, p.y, 0) -- (pn.x, pn.y, 0), vchambcolor);

    if (i == 4) {
        ////label("Vacuum System", xyline(p, pn, 0.5), SW, vchambcolor); 
      	pair spo = xyline(p, pn, 0.5);
      	label("\sffamily\LARGE Vacuum System", (spo.x, spo.y, -R/20), SE, vchambcolor);
    }

    if (i != 1) {
            r = 0.2;    
            //pair k = xyline(p, pn, r);
            //fill(quad(xyline(p, pn, r), (thetan+theta)/2), quadcolor);
      		drawquad(xyline(p, pn, r), (thetan+theta)/2, quadcolor);
            //pair k = xyline(p, pn, 1-r);
            if (i != n-1) {
                //fill(quad(xyline(p, pn, 1-r), (thetan+theta)/2), quadcolor); 
              	drawquad(xyline(p, pn, 1-r), (thetan+theta)/2, quadcolor);
            }
            if (i == n-2) {
                ////label(minipage("\flushright Focusing Magnets\\ {\color{orange}Quadrupoles}"), (-R/10, 0)+xyline(p, pn, 1-r), W);
              pair spo = xyline(p, pn, 1-r);
              label("\sffamily\LARGE Focusing Magnets", (spo.x, spo.y, R/8), NW);
              label("\sffamily\LARGE Quadrupoles", (spo.x, spo.y, R/16), NW, quadcolor);
            }
    
            r = 0.3;
            // pair k = xyline(p, pn, r);
            //fill(sext(xyline(p, pn, r), (thetan+theta)/2), sextcolor);
      		drawsext(xyline(p, pn, r), (thetan+theta)/2, sextcolor);
            // pair k = xyline(p, pn, 1-r);
            if (i != n-1) {
                //fill(sext(xyline(p, pn, 1-r), (thetan+theta)/2), sextcolor); 
              	drawsext(xyline(p, pn, 1-r), (thetan+theta)/2, sextcolor);
            }
            if (i == n-4) {
                ////label("High-order Magnets", (-R/10, +R/15)+xyline(p, pn, 1-r), W);
                ////label("Sextupoles, Octupoles", (-R/10, -R/15)+xyline(p, pn, 1-r), W, sextcolor);
              pair spo = xyline(p, pn, 1-r);
              label("\sffamily\LARGE High-order-field Magnets", (spo.x, spo.y, -R/18), SW);
              label("\sffamily\LARGE Sextupoles, Octupoles", (spo.x, spo.y, -R/8), SW, sextcolor);
            }
    }
    else {
      	pair spo = xyline(p, pn, 0.5);
      	drawcavity((spo.x, spo.y, 0), (thetan+theta)/2, cavitycolor);
      	label("\sffamily\LARGE RF Cavity", (spo.x, spo.y, R/16), NE);
    }
}

for (int i=0; i<n; ++i) {
    theta = i*2pi/n;
    p = (R - 0.02*res)*(sin(theta), cos(theta));
  	drawdip(p, theta, dipcolor);
}
label("\sffamily\LARGE Guidance Magnets", (0, R, R/8), N);
label("\sffamily\LARGE Dipoles", (0, R, R/16), N, dipcolor);

//label(minipage("\centering Beam\\ Injection"), (-R/8,R/2), vchambcolor); 
//label("Vacuum System", (-0.85*R, -0.94*R), vchambcolor); 
//label(minipage("\centering Guidance Magnets\\ {\color{blue}Dipoles}"), (1.6*R,0));
//label(minipage("\centering Focusing Magnets\\ {\color{orange}Quadrupoles}"), (-1.5*R, -R/4));
//label("High-order Magnets", (-1.5*R, R/1.5));
//label("Sextupoles, Octupoles...", (-1.5*R, R/1.5 - R/8), sextcolor);
//label(minipage("\centering RF Cavity"), (1.25*R, 1.2*R/3));

//fill(box((-2*R, -R), (2*R, 1.0*R)), invisible);


//xaxis3(0, 0.5, red);
//yaxis3(0, 0.5, green);
//zaxis3(0, 0.5, blue);

draw((-1.5*R, 0, 0) -- (1.5*R, 0, 0), invisible);

currentprojection = orthographic(0, -5, 3);

// currentlight = light( (-0.5, 0.5, 3) );
//currentlight = light( (1.1*R, -0.5*R, 2) );

currentlight =  light(gray(0.9), specularfactor=3,(0.5,0.5,5), specular=gray(0.6));
