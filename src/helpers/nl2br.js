import { h } from 'vue';

export default {
  functional: true,
  props: {
    tag: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  methods: {
    splitNl(t) {
      return t.split('\n').reduce((a, v) => {
        if (!Array.isArray(a)) {
          return [a, h('br'), this.splitTabs(v)];
        }
        return a.concat([h('br'), this.splitTabs(v)]);
      });
    },
    splitTabs(t) {
      return t.split('\t').reduce((a, v) => {
        if (!Array.isArray(a)) {
          return [a, h('span', { class: "code-tab"}), v];
        }
        return a.concat([h('span', { class: "code-tab"}), v]);
      });
    },
  },
  render() {
    return h(this.tag, {}, this.splitNl(this.text));
  },
};