import { readdir } from 'node:fs/promises'
import { Hono } from 'hono'

// Lists the image files in public/toons and public/trinkets, so that new images show up by
// being dropped into those folders.
export const images = new Hono()

images.get('/:folder{toons|trinkets}', async (c) => {
	const files = await readdir(`public/${c.req.param('folder')}`)
	return c.json(files.filter((file) => file.endsWith('.png')).sort())
})
