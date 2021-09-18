import { IContactsEventHandler, IDriveEventHandler } from './EventInterfaces'

interface Globals {
    drive: IDriveEventHandler,
    contacts: IContactsEventHandler
}

export default <Globals><unknown>window