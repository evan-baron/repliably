'use client';

// Library imports
import React, { useState, useEffect } from 'react';

// Components imports
import TTT from './toTheTop/TTT';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const FAB = ({ type }: { type: string }) => {
	const { isMobile } = useAppContext();

	const [showFAB, setShowFAB] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const showAfter = Math.max(window.innerHeight / 2, 300);
			setShowFAB(window.scrollY > showAfter);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const FABContent = (type: string) => {
		switch (type) {
			case 'ttt':
				return showFAB ? <TTT isMobile={isMobile ?? false} /> : null;

			default:
				return null;
		}
	};

	return FABContent(type);
};

export default FAB;
