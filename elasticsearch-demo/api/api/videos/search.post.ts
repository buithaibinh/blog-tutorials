export default eventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  await useStorage('db').setItem('foo', { hello: 'world' });
  // TODO: Handle body and add user
  return { updated: true };
});
