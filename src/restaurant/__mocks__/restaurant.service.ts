import { restaurantStub } from '../test/stubs/restaurant.stub';

export const RestaurantService = jest.fn().mockReturnValue({
  createRestaurant: () => jest.fn().mockResolvedValue(restaurantStub()),
});
