Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    loading: {
      type: Boolean,
      value: true
    },
    /** text | avatar | list | card | image | custom */
    type: {
      type: String,
      value: 'list'
    },
    avatar: {
      type: Boolean,
      value: true
    },
    title: {
      type: Boolean,
      value: true
    },
    row: {
      type: Number,
      value: 3
    },
    animate: {
      type: Boolean,
      value: true
    },
    /** 列表条数，type=list/card 时有效 */
    count: {
      type: Number,
      value: 3
    }
  },
  data: {
    rows: [0, 1, 2],
    items: [0, 1, 2]
  },
  observers: {
    'row, count': function (row: number, count: number) {
      const r = Math.max(1, Number(row) || 3)
      const c = Math.max(1, Number(count) || 3)
      const rows: number[] = []
      const items: number[] = []
      for (let i = 0; i < r; i++) rows.push(i)
      for (let i = 0; i < c; i++) items.push(i)
      this.setData({ rows, items })
    }
  }
})
