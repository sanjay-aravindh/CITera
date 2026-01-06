// main.js  (type="module" in HTML)

// 1) Firebase init
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// 2) Get current teacher UID
let teacherUID = null;
onAuthStateChanged(auth, (user) => {
  teacherUID = user ? user.uid : null;
});

// 3) Upload function
async function uploadPdfAndSaveMeta(file, teacherUID, title, subject, description) {
  const docRef = doc(db, "documents");
  const docId = docRef.id;

  const path = `documents/${teacherUID}/${docId}.pdf`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  await setDoc(docRef, {
    title,
    subject,
    description,
    fileURL: url,
    status: "draft",
    timestamp: serverTimestamp(),
    uploadedBy: teacherUID,
  });
}

// 4) Connect button click → call upload function
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("pdfInput");

uploadBtn.onclick = async () => {
  if (!teacherUID) {
    alert("Login first");
    return;
  }
  const file = fileInput.files[0];
  if (!file) {
    alert("Choose a PDF");
    return;
  }

  await uploadPdfAndSaveMeta(file, teacherUID, "Title", "Subject", "Description");
  alert("Uploaded!");
};
