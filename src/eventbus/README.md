# The EventBus
To allow easy communication between components that might not be directly related the EventBus can be used.

E.g. to let a child of child know an event has taken place you can utilize the event bus. Please be  sure to document the events you use to make sure no duplicate events can be generated.

## How to use
The EventBus is a communication channel, you will need to import it in your component. You can do so in the following way.

`import EventBus from '@/eventbus;`

Then you have two options, either listen for events to happen or send events. Sending can be done in the following way.

`EventBus.$emit('eventName', parameters, ...);`

To then listen for said event you need to register an event listener in your component.

`EventBus.$on('eventName', (parameters) => {});`

Where you can put a call-back function between the `{}`.

## Events currently in use
Please list the events you are using here and how to use them

### localeUpdated
This event is being cast when the locale is updated, this allows components to update their locales if needed.
Currently this is being used for the table headers as they did not update in stacked mode automatically.


#### Parameters
- None
