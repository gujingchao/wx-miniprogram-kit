Page({
  data: {
    loading: true,
    type: 'list'
  },
  onToggle() {
    this.setData({ loading: !this.data.loading })
  },
  onType(e: any) {
    this.setData({ type: e.currentTarget.dataset.key, loading: true })
  }
})
