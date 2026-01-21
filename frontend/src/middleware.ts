import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mapeamento de rotas protegidas
const protectedRoutes = ['/dashboard', '/orders', '/tables', '/products', '/settings']
const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
    // Como o token está no localStorage (client-side), o middleware do Next.js (server-side)
    // não consegue lê-lo diretamente dos cookies se não estivermos usando cookies.
    // Entretanto, para uma proteção básica de redirecionamento, podemos verificar
    // se existe algum cookie de sessão se optarmos por essa estratégia.

    // Nota: Com JWT em localStorage, a proteção de rota real acontece no Client Component (useAuth)
    // ou precisamos mover o token para Cookie para proteção server-side real.

    // Por enquanto, vamos permitir o acesso e deixar o useAuth redirecionar no client
    // OU implementar lógica de cookie aqui futuramente.

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
