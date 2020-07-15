   //sign in google
   let currentUser;
   let btnSigninWithGoogle = document.getElementById("signin-google");
   btnSigninWithGoogle.addEventListener("click", async (event) => {
       await authenticateWithGoogle();
   });

   function authenticateWithGoogle() {
       var provider = new firebase.auth.GoogleAuthProvider();
       firebase
           .auth()
           .signInWithPopup(provider)
           .then(function (result) {
               var token = result.credential.accessToken;
               currentUser = result.user;
           })
           .catch(function (error) {
               var errorCode = error.code;
               var errorMessage = error.message;
               var email = error.email;
               var credential = error.credential;
               console.log(error);
           });
   }

   function updateUser() {
       firebase
           .database()
           .ref("messages/users/" + currentUser.uid)
           .update({
               name: currentUser.displayName,
               email: currentUser.email,
               photo: currentUser.photoURL,
           }).then(() => {
               location.href = './index.html'
           })
   }