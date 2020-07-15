let mypic = document.getElementById('mypic')
let name = document.getElementById('name')
let btnSave = document.getElementById('btnSave')
let rsaKey = document.getElementById('rsaKey')
let keyFile = document.getElementById('keyFile')
let currentUser;
let notSet;
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        mypic.src = user.photoURL
        currentUser = user
        name.insertAdjacentHTML("beforeend", '<h3>' + user.displayName + '</h3><small>' + user.email + '</small>')
        firebase.database().ref("messages/users/" + currentUser.uid).once('value', snapshot => {
            if (snapshot.val().publicKey) rsaKey.value = snapshot.val().publicKey
            else {
                notSet = true
                rsaKey.value = ''
            }
        })
    } else {
        location.href = './login.html'
    }
});

btnSave.addEventListener('click', ev => {
    if (rsaKey.value.trim() !== '') {
        if (confirm("If this is your first time setting your public key, pls ignore this message. Once you change your public key, you cannot be able to decrypt or read your previous messages that use your current key.")) {
            firebase.database()
                .ref("messages/users/" + currentUser.uid + "/publicKey").set(rsaKey.value)
                .then(() => {
                    location.href = './index.html'
                })
        }
    }
})

keyFile.addEventListener("change", (event) => {
    var file = keyFile.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        rsaKey.value = e.target.result
    };
    reader.readAsText(file);
});