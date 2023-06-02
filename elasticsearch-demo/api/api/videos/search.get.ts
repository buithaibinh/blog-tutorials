export default eventHandler(async (event) => {
  const { id } = event.context.params;
  // TODO: fetch user by id
  return {
    id,
    name: 'John Doe',
  }
});
