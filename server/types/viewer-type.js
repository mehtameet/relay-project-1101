import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import { globalIdField, connectionArgs, connectionFromArray } from 'graphql-relay';

import { widgetConnectionType } from '../connections/widgets';
import { carConnectionType } from '../connections/cars';
import { WidgetData } from '../models/widget-data';
import { CarData } from '../models/car-data';
import { Widget, Viewer, Car } from '../models/graphql-models';
import { nodeInterface } from '../utils/node-definitions';
import { registerType } from '../utils/resolve-type';

export const viewerType = new GraphQLObjectType({

  name: 'Viewer',
  description: 'User of the application',
  fields: () => ({
    id: globalIdField('Viewer'),
    makes: {
      type: new GraphQLList(GraphQLString),
      resolve: () => ([ 'Toyota', 'Chevrolet', 'Nissan', 'Honda', 'GM', 'Ford', 'Tesla' ])
    },
    models: {
      type: new GraphQLList(GraphQLString),
      resolve: () => ([ 'RAV4', 'Volt', 'Maxima', 'Accord', 'T', 'Model S' ])
    },
    colors: {
      type: new GraphQLList(GraphQLString),
      resolve: () => ([ 'black', 'blue', 'red', 'green', 'gold', 'grey' ])
    },
    widgets: {
      type: widgetConnectionType,
      description: 'get all of the widgets',
      args: connectionArgs,
      resolve: (_, args, { baseUrl }) => {
        const widgetData = new WidgetData(baseUrl);
        return widgetData.all().then(widgets => {
          const widgetModels = widgets.map(w => Object.assign(new Widget(), w));
          const conn = connectionFromArray(widgetModels, args);
          conn.totalCount = widgetModels.length;
          return conn;
        });
      },
    },
    cars: {
      type: carConnectionType,
      description: 'get all of the cars',
      args: connectionArgs,
      resolve: (_, args, { baseUrl }) => {
        const carData = new CarData(baseUrl);
        return carData.all().then(cars => {
          let totalPrice = 0;
          const carModels = cars.map(c => Object.assign(new Car(), c));
          cars.forEach((w) => totalPrice += w.price);
          const conn = connectionFromArray(carModels, args);
          conn.totalCount = carModels.length;
          conn.totalPrice = totalPrice;
          return conn;

        });
      },
    },
  }),

  interfaces: () => [ nodeInterface ],

});

registerType(Viewer, viewerType, id => {
  return Object.assign(new Viewer(), { id });
});
