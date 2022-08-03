// POST /api
export const onRequestPost: PagesFunction = async context => {
  const formData = await context.request.formData()

  console.log(formData)

  return new Response("hit post api")
}

// GET /api
export const onRequest: PagesFunction = async context => {
  return new Response("hit get api")
}
