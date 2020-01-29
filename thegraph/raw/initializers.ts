import { Address, Bytes } from '@graphprotocol/graph-ts/index';
import {
  AToken,
  PriceOracle,
  PriceOracleAsset,
  Reserve,
  User,
  UserReserve,
  ReserveParamsHistoryItem,
  ReserveConfigurationHistoryItem,
  LendingPoolConfiguration,
  Referrer,
  ChainlinkAggregator,
} from './generated/schema';
import { zeroAddress, zeroBD, zeroBI } from '../utils/converters';

export function getUserReserveId(userAddress: Address, reserveAddress: Address): string {
  return userAddress.toHexString() + reserveAddress.toHexString();
}

export function getOrInitLendingPoolConfiguration(): LendingPoolConfiguration {
  let lendingPoolConfiguration = LendingPoolConfiguration.load('1');
  if (!lendingPoolConfiguration) {
    lendingPoolConfiguration = new LendingPoolConfiguration('1');
  }
  return lendingPoolConfiguration as LendingPoolConfiguration;
}

export function getOrInitUser(address: Address): User {
  let user = User.load(address.toHexString());
  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }
  return user as User;
}

export function getOrInitUserReserve(_user: Address, _poolReserve: Address): UserReserve {
  let userReserveId = getUserReserveId(_user, _poolReserve);
  let userReserve = UserReserve.load(userReserveId);
  if (userReserve === null) {
    userReserve = new UserReserve(userReserveId);
    userReserve.usageAsCollateralEnabledOnUser = true;
    userReserve.principalATokenBalance = zeroBI();
    userReserve.redirectedBalance = zeroBI();
    userReserve.interestRedirectionAddress = zeroAddress();
    userReserve.interestRedirectionAllowance = zeroAddress();
    userReserve.principalBorrows = zeroBI();
    userReserve.userBalanceIndex = zeroBI();
    userReserve.borrowRateMode = 'Variable';
    userReserve.borrowRate = zeroBI();
    userReserve.variableBorrowIndex = zeroBI();
    userReserve.originationFee = zeroBI();
    userReserve.lastUpdateTimestamp = 0;

    let user = getOrInitUser(_user);
    userReserve.user = user.id;

    let poolReserve = getOrInitReserve(_poolReserve);
    userReserve.reserve = poolReserve.id;
  }
  return userReserve as UserReserve;
}

export function getOrInitReserve(id: Address): Reserve {
  let reserve = Reserve.load(id.toHexString());
  if (reserve === null) {
    reserve = new Reserve(id.toHexString());
    reserve.pool = '1';
    reserve.symbol = '';
    reserve.name = '';
    reserve.decimals = 0;
    reserve.usageAsCollateralEnabled = false;
    reserve.borrowingEnabled = false;
    reserve.stableBorrowRateEnabled = false;
    reserve.isActive = false;
    reserve.baseLTVasCollateral = zeroBI();
    reserve.reserveLiquidationThreshold = zeroBI();
    reserve.reserveLiquidationBonus = zeroBI();
    reserve.reserveInterestRateStrategy = new Bytes(1);
    reserve.utilizationRate = zeroBD();
    reserve.totalLiquidity = zeroBI();
    reserve.availableLiquidity = zeroBI();
    reserve.totalBorrows = zeroBI();
    reserve.totalBorrowsStable = zeroBI();
    reserve.totalBorrowsVariable = zeroBI();
    reserve.liquidityRate = zeroBI();
    reserve.variableBorrowRate = zeroBI();
    reserve.stableBorrowRate = zeroBI();
    reserve.liquidityIndex = zeroBI();
    reserve.variableBorrowIndex = zeroBI();
    reserve.aToken = zeroAddress().toHexString();

    let priceOracleAsset = getPriceOracleAsset(reserve.id);
    if (!priceOracleAsset.lastUpdateTimestamp) {
      priceOracleAsset.oracle = getOrInitPriceOracle().id;
      priceOracleAsset.lastUpdateTimestamp = 0;
      priceOracleAsset.save();
    }
    reserve.price = priceOracleAsset.id;
    // TODO: think about AToken
  }
  return reserve as Reserve;
}

export function getChainlinkAggregator(id: string): ChainlinkAggregator {
  let chainlinkAggregator = ChainlinkAggregator.load(id);
  if (!chainlinkAggregator) {
    chainlinkAggregator = new ChainlinkAggregator(id);
    chainlinkAggregator.oracleAsset = '';
  }
  return chainlinkAggregator as ChainlinkAggregator;
}

export function getPriceOracleAsset(id: string): PriceOracleAsset {
  let priceOracleReserve = PriceOracleAsset.load(id);
  if (!priceOracleReserve) {
    priceOracleReserve = new PriceOracleAsset(id);
    priceOracleReserve.oracle = getOrInitPriceOracle().id;
    priceOracleReserve.priceSource = Bytes.fromHexString(
      '0x0000000000000000000000000000000000000000'
    ) as Bytes;
    priceOracleReserve.priceInEth = zeroBI();
    priceOracleReserve.isFallbackRequired = false;
    priceOracleReserve.lastUpdateTimestamp = 0;
    priceOracleReserve.save();
  }
  return priceOracleReserve as PriceOracleAsset;
}

export function getOrInitPriceOracle(): PriceOracle {
  let priceOracle = PriceOracle.load('1');
  if (!priceOracle) {
    priceOracle = new PriceOracle('1');
    priceOracle.usdPriceEth = zeroBI();
    priceOracle.lastUpdateTimestamp = 0;
    priceOracle.fallbackPriceOracle = zeroAddress();
    priceOracle.tokensWithFallback = [];
    priceOracle.save();
  }
  return priceOracle as PriceOracle;
}

export function getOrInitAToken(id: Address): AToken {
  let aToken = AToken.load(id.toHexString());
  if (!aToken) {
    aToken = new AToken(id.toHexString());
    aToken.underlyingAssetAddress = new Bytes(1);
    aToken.underlyingAssetDecimals = 18;
  }
  return aToken as AToken;
}

export function getOrInitReserveParamsHistoryItem(
  id: Bytes,
  reserve: Reserve
): ReserveParamsHistoryItem {
  let reserveParamsHistoryItem = ReserveParamsHistoryItem.load(id.toHexString());
  if (!reserveParamsHistoryItem) {
    reserveParamsHistoryItem = new ReserveParamsHistoryItem(id.toHexString());
    reserveParamsHistoryItem.variableBorrowRate = zeroBI();
    reserveParamsHistoryItem.variableBorrowIndex = zeroBI();
    reserveParamsHistoryItem.utilizationRate = zeroBD();
    reserveParamsHistoryItem.stableBorrowRate = zeroBI();
    reserveParamsHistoryItem.liquidityIndex = zeroBI();
    reserveParamsHistoryItem.liquidityRate = zeroBI();
    reserveParamsHistoryItem.totalLiquidity = zeroBI();
    reserveParamsHistoryItem.availableLiquidity = zeroBI();
    reserveParamsHistoryItem.totalBorrows = zeroBI();
    reserveParamsHistoryItem.totalBorrowsVariable = zeroBI();
    reserveParamsHistoryItem.totalBorrowsStable = zeroBI();
    reserveParamsHistoryItem.reserve = reserve.id;
  }
  return reserveParamsHistoryItem as ReserveParamsHistoryItem;
}

export function getOrInitReserveConfigurationHistoryItem(
  id: Bytes,
  reserve: Reserve
): ReserveConfigurationHistoryItem {
  let reserveConfigurationHistoryItem = ReserveConfigurationHistoryItem.load(id.toHexString());
  if (!reserveConfigurationHistoryItem) {
    reserveConfigurationHistoryItem = new ReserveConfigurationHistoryItem(id.toHexString());
    reserveConfigurationHistoryItem.usageAsCollateralEnabled = false;
    reserveConfigurationHistoryItem.borrowingEnabled = false;
    reserveConfigurationHistoryItem.stableBorrowRateEnabled = false;
    reserveConfigurationHistoryItem.isActive = false;
    reserveConfigurationHistoryItem.reserveInterestRateStrategy = new Bytes(1);
    reserveConfigurationHistoryItem.baseLTVasCollateral = zeroBI();
    reserveConfigurationHistoryItem.reserveLiquidationThreshold = zeroBI();
    reserveConfigurationHistoryItem.reserveLiquidationBonus = zeroBI();
    reserveConfigurationHistoryItem.reserve = reserve.id;
  }
  return reserveConfigurationHistoryItem as ReserveConfigurationHistoryItem;
}

// @ts-ignore
export function getOrInitReferrer(id: i32): Referrer {
  let referrer = Referrer.load(id.toString());
  if (!referrer) {
    referrer = new Referrer(id.toString());
    referrer.save();
  }
  return referrer as Referrer;
}
