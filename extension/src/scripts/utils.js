// Some utility functions

/**
 * Increments a tab index for views
 * @export
 * @returns next global tab index
 */
function nextTabIndex() {
   nextTabIndex.idx = ++nextTabIndex.idx || 1;
   return nextTabIndex.idx;
}


/**
 * Clears all Chrome notifications
 * @export
 */
function clearNotifications() {
   chrome.notifications.getAll((notifications) => {
      let notificationIds = Object.keys(notifications);

      notificationIds.forEach((notificationId) => {
         chrome.notifications.clear(notificationId);
      });
   });
}

export { nextTabIndex, clearNotifications };