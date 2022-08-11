import {upload} from "./upload";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCgTemjffPW4am690bKvgCcDtKvCSlan_A",
    authDomain: "upload-files-b4729.firebaseapp.com",
    projectId: "upload-files-b4729",
    storageBucket: "upload-files-b4729.appspot.com",
    messagingSenderId: "318179831129",
    appId: "1:318179831129:web:4ad3aa3bfe6f1fd2d77048"
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

let urls: string[] = [];

upload('#input', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.mp4'],
    onUpload(files, blocks) {
       files.forEach((file: any, idx: number) => {
           const reference = ref(storage, `images/${file.name}`);
           const uploadTask = uploadBytesResumable(reference, file);

           uploadTask.on('state_changed',
               (snapshot) => {
                    const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
                    const block = blocks[idx].querySelector('.preview-info-progress');

                    block.textContent = percentage + '%';
                    block.style.width = percentage + '%';
               },
               (error) => console.error(error),
               () => {
                   getDownloadURL(reference).then(url => {
                       urls.push(url);
                   }).then(() => {
                       if (urls.length == files.length) {
                           addImage();
                       }
                   })
               })
       })
    }
})

const addImage = () => {
    const container = document.querySelector('.container');

    if (!container) return;

    urls.forEach((item) => {
        const node: any = document.createElement('img');
        node.style.width = 150;
        node.style.height = 150;
        node.setAttribute('src', item);

        container.insertAdjacentElement('afterend', node);
    })
}
