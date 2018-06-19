Component({
  properties: {
    navItems: {
      type: Array
    },
    navActive: {
      type: Number
    }
  },
  data: {

  },
  methods: {
    navChange: function (e) {
      this.setData({
        navActive: e.target.dataset.index
      })
      let eventDetail = {
        navActive: e.target.dataset.index
      } 
      this.triggerEvent('navclick', eventDetail)
    },
  }
})