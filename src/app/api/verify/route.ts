import { NextResponse, type NextRequest } from 'next/server';

const POST = ( req: NextRequest ) =>
{
    console.log( req.body );
    const token = Date.now();
    const response = NextResponse.json( { token } );
    response.cookies.set( 'token', `${ token }`, {
        httpOnly: true,
        secure: true,
        maxAge: 300,
        path: '/',
        // Cross-site iframe (e.g. Vercel parent → Worker child) requires SameSite=None.
        sameSite: 'none'
    } );
    return response;
};
export { POST };
