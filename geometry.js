
//------ CREATING MESH SHAPES

const VERTEX_SIZE = 12;

// CREATE A MESH FROM A PARAMETRIC FUNCTION

let createMesh = (nu, nv, f, data) => {
   let tmp = [];
   for (let v = 0 ; v < 1 ; v += 1/nv) {
      for (let u = 0 ; u <= 1 ; u += 1/nu) {
         tmp = tmp.concat(f(u,v,data));
         tmp = tmp.concat(f(u,v+1/nv,data));
      }
      tmp = tmp.concat(f(1,v,data));
      tmp = tmp.concat(f(0,v+1/nv,data));
   }
   return new Float32Array(tmp);
}

let createMesh2 = (nu, nv, f, data, data2) => {
   let tmp = [];
   for (let v = 0 ; v < 1 ; v += 1/nv) {
      for (let u = 0 ; u <= 1 ; u += 1/nu) {
         tmp = tmp.concat(f(u,v,data, data2));
         tmp = tmp.concat(f(u,v+1/nv,data, data2));
      }
      tmp = tmp.concat(f(1,v,data, data2));
      tmp = tmp.concat(f(0,v+1/nv,data, data2));
   }
   return new Float32Array(tmp);
}

// GLUE TWO MESHES TOGETHER INTO A SINGLE MESH

let glueMeshes = (a, b) => {
   let c = [];
   for (let i = 0 ; i < a.length ; i++)
      c.push(a[i]);                           // a
   for (let i = 0 ; i < VERTEX_SIZE ; i++)
      c.push(a[a.length - VERTEX_SIZE + i]);  // + last vertex of a
   for (let i = 0 ; i < VERTEX_SIZE ; i++)
      c.push(b[i]);                           // + first vertex of b
   for (let i = 0 ; i < b.length ; i++)
      c.push(b[i]);                           // + b
   return new Float32Array(c);
}

let createSquareMesh = (i, z) => {
   let m = [], n = VERTEX_SIZE, j = z < 0 ? (i + 2) % 3 : (i + 1) % 3,
                                k = z < 0 ? (i + 1) % 3 : (i + 2) % 3;

   for (let i = 0 ; i < 4 * n ; i++)
      m[i] = 0;

   m[i] = m[1*n+i] = m[2*n+i] = m[3*n+i] =  z;
   m[j] = m[2*n+j] = m[2*n+k] = m[3*n+k] = -1;
   m[k] = m[1*n+j] = m[1*n+k] = m[3*n+j] =  1;

   m[3+i] = m[1*n+3+i] = m[2*n+3+i] = m[3*n+3+i] = z < 0 ? -1 : 1;
   m[3+j] = m[1*n+3+j] = m[2*n+3+j] = m[3*n+3+j] = 0;
   m[3+k] = m[1*n+3+k] = m[2*n+3+k] = m[3*n+3+k] = 0;

   m[6] = m[1*n+6] = m[2*n+6] = m[3*n+6] = 1;

   return new Float32Array(m);
}


let mouthh=[-1,30,30,30];
let armorh=[0,20,10,10];
let armorh2=[0,10,15,25];
let faceh=[-1,30,30,30];
let cuph=[0,15,50,10];
let hornh=[0,10,20,10];
let hermiteMatrix1 = [ 2,-3,0,1, -2,3,0,0, 1,-2,1,0, 1,-1,0,0 ];
//let hermiteMatrix1 = [ -1,3,-3,1, 3,-6,3,0, -3,3,0,0, 1,0,0,0 ];

let evalSpline = (h,t,a) => {
      let C = matrix_transform(hermiteMatrix1, [h+a[0],h+a[1],h+a[2],h+a[3]]);
      return t*t*t*C[0] + t*t*C[1] + t*C[2] + C[3];
}



let squareMesh = createSquareMesh(2, 0);

let cubeMesh = glueMeshes(
               glueMeshes(glueMeshes(createSquareMesh(0,-1),createSquareMesh(0,1)),
                          glueMeshes(createSquareMesh(1,-1),createSquareMesh(1,1))),
                          glueMeshes(createSquareMesh(2,-1),createSquareMesh(2,1)) );

let uvToTorus = (u,v,r) => {
   let theta = 2 * Math.PI * u;
   let phi   = 2 * Math.PI * v;

   let x = Math.cos(theta) * (1 + r * Math.cos(phi));
   let y = Math.sin(theta) * (1 + r * Math.cos(phi));
   let z = r * Math.sin(phi);

   let nx = Math.cos(theta) * Math.cos(phi);
   let ny = Math.sin(theta) * Math.cos(phi);
   let nz = Math.sin(phi);

   return [x,y,z, nx,ny,nz, 1,0,0,0,0,0];
}

let uvToSphere = (u,v) => {
   let theta = 2 * Math.PI * u;
   let phi   = Math.PI * (v - .5);
   let x = Math.cos(theta) * Math.cos(phi);
   let y = Math.sin(theta) * Math.cos(phi);
   let z = Math.sin(phi);
   return [x,y,z, x,y,z, 1,0,0,0,0,0];
}
let uvToHSphere = (u,v) => {
   let theta = 1 * Math.PI * u;
   let phi   = Math.PI * (v - .5);
   let x = Math.cos(theta) * Math.cos(phi);
   let y = Math.sin(theta) * Math.cos(phi);
   let z = Math.sin(phi);
   return [x,y,z, x,y,z, 1,0,0,0,0,0];
}
let uvToTube = (u,v) => {
   let theta = 2 * Math.PI * u;
   let x = Math.cos(theta);
   let y = Math.sin(theta);
   let z = 2 * v - 1;
   return [x,y,z, x,y,0, 1,0,0,0,0,0];
}

let uvToDisk = (u,v,dz) => {
   if (dz === undefined)
      dz = 0;
   let theta = 2 * Math.PI * u;
   let x = Math.cos(theta) * v;
   let y = Math.sin(theta) * v;
   let z = dz;
   return [x,y,z, 0,0,dz ? Math.sign(dz) : 1, 1,0,0,0,0,0];
}

let uvToSor = (u,v,S,d) => {
   let z0 = evalSpline(S[0], v, d);
   let z1 = evalSpline(S[0], v + (1/1000), d);

   let r0 = evalSpline(S[1], v, d);
   let r1 = evalSpline(S[1], v + (1/1000), d);

   let tilt = Math.atan2(r0 - r1, z1 - z0);

   let x = r0 * Math.cos(2*Math.PI* u);         // POSITION
   let y = r0 * Math.sin(2 *Math.PI* u);
   let z = z0;

   let nx = Math.cos(tilt) * Math.cos(2 *Math.PI* u);// NORMAL
   let ny = Math.cos(tilt) * Math.sin(2 *Math.PI* u);
   let nz = Math.sin(tilt);

   return [x,y,(z), nx,ny,(nz), 1,0,0,0,0,0];
}


let hornMesh    = createMesh2(32, 32, uvToSor,[-5,-20], armorh);

let torusMesh    = createMesh(32, 16, uvToTorus, .5);
let halfsphereMesh2   = createMesh(10, 5, uvToHSphere);
let sphereMesh   = createMesh(32, 16, uvToSphere);
let tubeMesh     = createMesh(32, 2, uvToTube);
let diskMesh     = createMesh(32, 2, uvToDisk);
let diskNMesh    = createMesh(32, 2, uvToDisk, -1);
let diskPMesh    = createMesh(32, 2, uvToDisk,  1);
let cylinderMesh = glueMeshes(glueMeshes(tubeMesh, diskPMesh), diskNMesh);

