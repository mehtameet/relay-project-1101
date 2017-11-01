import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay';

import { CarViewRowContainer } from './car-view-row';
import { CarEditRowContainer } from './car-edit-row';

export class CarTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      lastPageLoaded: 0,
      pageLength: 3,
    };
  }

  static defaultProps = {
    viewer: {
      cars: {
        edges: [],
      },
    },
  }

  onEditCar = id => {
    //Sets the editing id to true
    this.setState({
      cars: {
        id
      }
    });
  };

  onCancelCar = id => {
    this.setState({
      cars: {}
    });
  };

  onSubmitCar = (car) => {
    this.props.onUpdateCar(car).then(this.setState({
      cars: {}
    }));
  };

  loadPrev = () => {

    if (!this.props.relay.isLoading()) {

      if (this.state.currentPage > 0) {
        this.setState({
          currentPage: this.state.currentPage - 1,
        });
      }

    }

  };

  loadNext = () => {

    if (!this.props.relay.isLoading()) {

      const nextPage = this.state.currentPage + 1;
      let { lastPageLoaded } = this.state;

      if (this.props.relay.hasMore() && nextPage > lastPageLoaded) {
        lastPageLoaded = nextPage;
        this.props.relay.loadMore(this.state.pageLength);
      }

      this.setState({
        currentPage: nextPage,
        lastPageLoaded,
      });

    }
  };

  createCar = () => {
    this.props.onCreateCar();
  }

  render() {

    return <div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>
            <th>Color</th>
            <th>Year</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {do {
            const { currentPage, pageLength } = this.state;
            const startIndex = currentPage * pageLength;
            const { edges: carEdges } = this.props.viewer.cars;
            const endIndex = startIndex + pageLength;

            if (this.props.viewer.cars == null) {
              <tr><td colSpan="6">There are no cars.</td></tr>;
            } else {
              carEdges.slice(startIndex, endIndex).map( ({ node: car }) => do {
            (
                this.state.cars && this.state.cars.id === car.id
            ) ?
              <CarEditRowContainer key={car.id} car={car}
                onCancelCar={this.onCancelCar}
                onSubmitCar= {this.onSubmitCar}
                />
            :
                <CarViewRowContainer key={car.id} car={car}
                  onDeleteCar={this.props.onDeleteCar}
                  onEditCar = {this.onEditCar}
                  />;
              });
            }
          }}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">
              <button type="button" onClick={this.createCar}>Create Car</button>
            </td>
            <td colSpan="4">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'right', width:'100%' }}>
                  {do {
                    if (this.state.currentPage > 0) {
                      <button type="button" onClick={this.loadPrev}>Prev</button>;
                    }
                  }}
                </div>
                <div style={{ textAlign: 'center', width:'100%' }}>
                  {this.state.currentPage + 1} of { Math.ceil(this.props.viewer.cars.totalCount / this.state.pageLength) } pages
                </div>
                <div style={{ textAlign: 'left', width:'100%' }}>
                  {do {
                    if (this.props.viewer.cars.pageInfo.hasNextPage
                      || this.state.currentPage < this.state.lastPageLoaded) {
                      <button type="button" onClick={this.loadNext}>Next</button>;
                    }
                  }}
                </div>
              </div>
            </td>
          </tr>
          <tr colSpan="6">Total Car Value: {
              this.props.viewer.cars.edges.reduce((a, b) => {
                  const num = !Number.isInteger(a) ? a.node.price : a;
                  return num + b.node.price;
              })
          }</tr>
        </tfoot>
      </table>
    </div>;
  }

}

export const PaginatedCarTableContainer = createPaginationContainer(
  CarTable,
  graphql.experimental`
    fragment paginatedCarTable_viewer on Viewer @argumentDefinitions(
        count: { type: "Int", defaultValue: 3 }
        cursor: { type: "String" }
      ) {
      cars(
        first: $count
        after: $cursor
      ) @connection(key: "CarTable_cars") {
        edges {
          node {
            id
            price
            ...carViewRow_car
            ...carEditRow_car
          }
          cursor
        }
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `, {
    direction: 'forward',
    getConnectionFromProps: (props) => {
      return props.viewer && props.viewer.cars;
    },
    getFragmentVariables: (prevVars, totalCount) => {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables: (props, { count, cursor }) => {
      return {
        count,
        cursor,
      };
    },
    query: graphql.experimental`
      query paginatedCarTableQuery(
        $count: Int!
        $cursor: String
      ) {
        viewer {
          ...paginatedCarTable_viewer @arguments(count: $count, cursor: $cursor)
        }
      }
    `
  },
);
