export function useNavigateUser() {
  const navigateUser = (userId: number, blank = true) => {
    void window.open(`/user/${userId}`, blank ? '_blank' : '_self');
  };

  return { navigateUser };
}
