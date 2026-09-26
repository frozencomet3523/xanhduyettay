/** Build CSP frame-ancestors from FRAME_ANCESTORS (space-separated origins / 'self'). */
export const buildFrameAncestorsCsp = (): string =>
{
    const raw = process.env.FRAME_ANCESTORS?.trim();
    if ( !raw )
    {
        return "frame-ancestors 'self';";
    }

    const normalized = raw
        .split( /\s+/ )
        .map( ( token ) =>
        {
            if ( token === "'self'" || token === 'self' )
            {
                return "'self'";
            }
            if ( token.startsWith( 'http://' ) || token.startsWith( 'https://' ) )
            {
                try
                {
                    return new URL( token ).origin;
                } catch
                {
                    return token.replace( /\/+$/, '' );
                }
            }
            return token;
        } )
        .join( ' ' );

    return `frame-ancestors ${ normalized };`;
};
