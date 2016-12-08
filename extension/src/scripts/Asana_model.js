import asana from 'asana';

export default class Asana_model {
   constructor() {
      this.client = asana.Client.create().useAccessToken(localStorage.accessToken);
      this.state = {
         user: {},
         tasks: {},
         tag: ""
      };
      this.update_all();
   }

   update_user() {
      chrome.extension.getBackgroundPage().console.log('updating');

      try {
         // Need to try-catch this, since 
         this.client.users.mproe().then((me) => {
            
            chrome.extension.getBackgroundPage().console.log(me);
         });         
      } catch (error) {
         
      }
   }

   update_all() {
      this.update_user();
   }

}