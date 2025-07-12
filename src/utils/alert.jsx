import Swal from 'sweetalert2';

export const showAlert = ({ title, text, icon = 'info', confirmButtonText = 'OK' }) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    confirmButtonColor: '#2563EB', 
  });
};
