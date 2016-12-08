import asana from 'asana';

export default class Asana_model {
   constructor() {
      this.client = asana.Client.create().useAccessToken(localStorage.accessToken);
      this.update_all();
   }

   update_user() {
      chrome.extension.getBackgroundPage().console.log('updating');

      this.client.users.me().then((me) => {
         chrome.extension.getBackgroundPage().console.log(me);
      });
   }

   update_all() {
      this.update_user();
   }


}