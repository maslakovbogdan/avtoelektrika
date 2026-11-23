// Epec 2040 face and key positions: 4W Herman User's Manual, figures 1 and 25.
// https://epec.fi/wp-content/uploads/2018/12/Epec-4W-Herman_Users-manual.pdf
window.drawHerman = function drawHerman(m) {
  const blue = "#145983", gray = "#777673", rubber = "#24303a";
  m.plate(0,0,-.105,3.2,2.2,.37,gray,.050,"front",.019);
  m.plate(0,0,.088,3.17,2.17,.029,rubber,.029);
  m.plate(0,0,.122,3.16,2.16,.045,gray,.025);
  // The blue overlay spans the full height between two broad cast-alloy uprights.
  m.plate(0,0,.153,2.40,2.155,.020,blue,.012);
  m.plate(0,.026,.164,2.17,1.66,.018,rubber,.014);
  // Only the laminated header and the five physical keys carry printed artwork.
  // Coordinates use the rectified 4W Herman blue membrane (including its printed margin).
  const print = (x,y,z,w,h,uv,material) =>
    m.decal(x,y,z,w,h,"@photo-screen",blue,"front",material,uv);
  print(0,.959,.166,2.39,.214,[0,0,1,.122],"label");
  m.decal(0,.027,.175,2.11,1.59,"@display","#202726","front","lcd");
  for (let i=0;i<5;i++) {
    const x=(i-2)*.416, u=.105+i*.173;
    m.plate(x,-.925,.168,.251,.169,.012,"#184972",.025);
    print(x,-.925,.176,.247,.165,[u,.878,.103,.086],"label");
  }
  for (const side of ["left","right"]) for (const y of [-.83,.83])
    m.screw(side==="left"?-1.6:1.6,y,-.105,side,.047);
  // Rear connector cover in the 4W Herman installation.
  m.plate(0,0,-.337,2.52,1.68,.112,rubber,.094,"back",.023);
  m.label(0,.03,-.397,.64,"back");
  for (const x of [-1.12,1.12]) for (const y of [-.68,.68])
    m.screw(x,y,-.398,"back",.050);
};
