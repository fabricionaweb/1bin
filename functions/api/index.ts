type Env = {
  DB: KVNamespace
}

enum HttpStatusCode {
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
}

// POST /api
export const onRequestPost: PagesFunction<Env> = async ({
  request,
  env: { DB },
}) => {
  const formData = await request.formData()
  const metadata = formData.get("iv") as string
  const file = formData.get("file") as File

  const uuid = crypto.randomUUID()
  const value = await file.arrayBuffer()

  try {
    await DB.put(uuid, value, {
      metadata,
      expirationTtl: 86400, // time to live (TTL) in seconds (86400 = 1 day)
    })
  } catch (e) {
    return new Response(null, { status: HttpStatusCode.BAD_REQUEST })
  }

  return Response.json({ uuid }, { status: HttpStatusCode.CREATED })
}

// GET /api
export const onRequest: PagesFunction<Env> = async ({
  request: { url },
  env: { DB },
}) => {
  const { searchParams } = new URL(url)
  const uuid = searchParams.get("uuid")

  const { value, metadata } = await DB.getWithMetadata<string>(uuid)

  if (!value) {
    return new Response(null, { status: HttpStatusCode.NOT_FOUND })
  }

  return new Response(value, {
    headers: {
      "content-type": "application/octet-stream",
      "x-iv": metadata,
    },
  })
}
