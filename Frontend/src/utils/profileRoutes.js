export const getProfilePath = (userId) => {
  if (!userId) return '/profile';
  return `/profile/${userId}`;
};
