import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import Page from '../src/routes/+page.svelte';

describe('Example Test', () => {
	it('renders the main page with the correct heading', () => {
		render(Page);
		const heading = screen.getByText('SonoLens');
		expect(heading).toBeInTheDocument();
	});
});

