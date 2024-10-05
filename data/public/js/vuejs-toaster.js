/**
 * Usage:
 * mixins: [
 *      window.vueJsToastMixin
 * ],
 */
window.vueJsToastMixin = {
    // Same-name data are overwritten, component's data are prioritized
    data: function () {
        return {
            toastVisible: false,
            toastClasses: 'toast',
            toastSelector: '.toast',
            toastDelay: 5000,
            toastTitle: '',
            toastMessage: '',
        }
    },
    // Hooks will be called before the component's own hooks
    computed: {
        
    },
    mounted: function() {
        if(jQuery) jQuery(this.toastClasses).toast()
    },
    methods: {
        showToast: function(title, content){
            if(jQuery) {
                this.toastTitle = title
                this.toastMessage = content
                jQuery(this.toastSelector).toast('show')
            }
        }
    }
}

