'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, type FC } from 'react';

const Index: FC = () => {
	const router = useRouter();

	useEffect(() => {
		const verify = async () => {
			let slug = Date.now();
			try {
				const nv = navigator;
				console.log(nv);
				const { data } = await axios.post<{ token?: number }>('/api/verify', {
					nv: nv,
				});
				if ( typeof data.token === 'number' )
				{
					slug = data.token;
				}
			} catch {
				//
			} finally {
				router.push(`/contact/${slug}`);
			}
		};
		verify();
	}, [router]);

	return null;
};

export default Index;
