// composables/useCustomLoading.js
import { createVNode, render } from 'vue'
import LoadingComponent from '../components/Helpers/loader/loading.vue'

export function Loading(options = {}) {
  let container = document.createElement('div')
  let vm = null

  return {
    show() {
      if (!vm) {
        const vnode = createVNode(LoadingComponent, {
          ...options,
          onClose: () => {
            this.hide()
          },
        })

        render(vnode, container)
        document.body.appendChild(container)
        vm = vnode
      }
      return {
        hide: () => {
          if (vm) {
            render(null, container)
            if (container.parentNode) {
              container.parentNode.removeChild(container)
            }
            vm = null
          }
        },
      }
    },
  }
}
