import type { Session } from './Session.ts';
export abstract class Command {
    abstract readonly kind: 'edit' | 'io' | 'display' | 'history';
    abstract execute(session: Session): string;
}
