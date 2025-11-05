export function showToast(message: string) {
  const toast = document.getElementById('toast')
  if (toast) {
    toast.textContent = message
    toast.classList.add('show')
    setTimeout(() => {
      toast.classList.remove('show')
    }, 3000)
  }
}
