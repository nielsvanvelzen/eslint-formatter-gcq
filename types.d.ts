declare namespace GitLabCodeQuality {
	export interface Issue {
		description: string;
		check_name: string;
		fingerprint: string;
		severity: 'info' | 'minor' | 'major' | 'critical' | 'blocker';
		location: { path: string; lines: { begin: number } } | { path: string; positions: { begin: { line: number } } };
	}
}
