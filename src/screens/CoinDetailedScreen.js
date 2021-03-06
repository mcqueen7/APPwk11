import React, { useState, useEffect } from "react";
import { Text, HStack, Switch, VStack, ScrollView, useColorMode, Button } from "native-base"
import { ActivityIndicator, Dimensions } from "react-native"
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import CoinDetailedHeader from "../components/CoinDetailedHeader";
import FilterComponent from "../components/FilterComponent"
import {
  getDetailedCoinData,
  getCoinMarketChart,
  getCandleChartData,
} from "../api";
import { useDispatch, useSelector } from "react-redux";
import { getCoinDetialAsync, selectCoinData } from "../redux/coinDetialetialSlice";
import { selectChartMode, toggleChartMode } from "../redux/chartModeSlice";
import { getCoinMarketAsync, selectCoinMarketData } from "../redux/marketDataSlice";
import { getCoinCandleAsync, selectCoinCandleData } from "../redux/candleDataSlice";

const chartColor = "#16c784";
const screenWidth = Dimensions.get("window").width * 0.8;

const CoinDetailedScreen = ({ route, navigation }) => {
  const dispatch=useDispatch();
  const coin=useSelector(selectCoinData);
  const candleChart=useSelector(selectChartMode);
  const coinMarket=useSelector(selectCoinMarketData);
  const coinCandle=useSelector(selectCoinCandleData);
  
  // console.log(candleChart);
  //console.log(coin.image.small);
   //console.log(coin);
 // const [coinn, setCoin] = useState(null);
  //const [coinMarketData, setCoinMarketData] = useState([]);
  const [coinCandleChartData, setCoinCandleChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState("1");
  // const [isCandleChartVisible, setIsCandleChartVisible] = useState(false);

  const { coinId } = route.params;
  const { colorMode } = useColorMode();


  // const fetchCoinData = async () => {
  //   const fetchedCoinData = await getDetailedCoinData(coinId);
  //   setCoin(fetchedCoinData);
  // };

  // const fetchMarketCoinData = async (selectedRangeValue) => {
  //   const fetchedCoinMarketData = await getCoinMarketChart(coinId,selectedRangeValue);
  //   setCoinMarketData(fetchedCoinMarketData);
  // };

  const fetchCandleStickChartData = async (selectedRangeValue) => {
    const fetchedSelectedCandleChartData = await getCandleChartData(
      coinId,
      selectedRangeValue
    );
    setCoinCandleChartData(fetchedSelectedCandleChartData);
  };

  const onSelectedRangeChange = (selectedRangeValue) => {
    //console.log("DFGHJUAQMWDJKA:   "+selectedRangeValue);
    setSelectedRange(selectedRangeValue);
    //fetchMarketCoinData(selectedRangeValue);
    //fetchCandleStickChartData(selectedRangeValue);
    dispatch(getCoinMarketAsync({id:coinId,rang:selectedRangeValue}));
    dispatch(getCoinCandleAsync({id:coinId,rang:selectedRangeValue}));
  };

  useEffect(() => {
    setLoading(true);
    //fetchCoinData();
    dispatch(getCoinDetialAsync(coinId));
    dispatch(getCoinMarketAsync({id:coinId,rang:1}));
    dispatch(getCoinCandleAsync({id:coinId,rang:1}));
    //console.log(coinMarket);
    //console.log(coinn);
    //fetchMarketCoinData(1);
    fetchCandleStickChartData(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    dispatch(getCoinDetialAsync(coinId));
    if (coin != null) {
      // console.log(coin);
      // console.log(coin.id);
      // console.log(coin.image);
      // console.log(coin.symbol);
      // console.log(coin.rank);
      navigation.setOptions({
        headerTitle: () => {
          return (
            <CoinDetailedHeader
              coinId={coin.id}
              image={coin.image}
              symbol={coin.symbol}
              marketCapRank={coin.rank}
            />
          )
        },
      });
    }
  }, )


  let line_data = [];
  coinMarket.prices?.map(([timestamp, value]) => line_data.push({ timestamp, value }))

  let candle_data = [];
  coinCandleChartData?.map(([timestamp, open, high, low, close]) => candle_data.push({ timestamp, open, high, low, close }))

  return (
    loading
      ? <ActivityIndicator size="large" />
      : (
        <ScrollView>
          <VStack flex={1} alignItems="center" mt={20}>
            <FilterComponent
              selectedRange={selectedRange}
              setSelectedRange={onSelectedRangeChange}
            />

            <HStack space={8} alignItems="center" mb={12} >
              <Text fontSize="lg">
                {!candleChart ? "Line Chart" : "Candle Chart"}
              </Text>
              {/* <Button onPress={()=>{console.log(coinCandle);console.log("ASDASDADASDASDASD");console.log(coinCandleChartData);}}>aaaaaaaaaaA</Button> */}

              <Switch
                size="sm"
                colorScheme="emerald"
                name="line Mode"
                isChecked={candleChart}
                onToggle={() => dispatch(toggleChartMode())}
                accessibilityLabel="line-mode"
                accessibilityHint="line or candle"
              />
            </HStack>
            {
              !candleChart
                ? (
                  <LineChart.Provider data={line_data} >
                    <LineChart height={screenWidth / 2} width={screenWidth}>
                      <LineChart.Path color={chartColor}>
                        <LineChart.Gradient color={colorMode === "dark" ? "white" : "black"} />
                      </LineChart.Path>
                      <LineChart.CursorCrosshair color={chartColor}>
                        <LineChart.Tooltip />
                        <LineChart.Tooltip position="bottom">
                          <LineChart.DatetimeText />
                        </LineChart.Tooltip>
                      </LineChart.CursorCrosshair>
                    </LineChart>
                  </LineChart.Provider>
                )
                : (
                  <CandlestickChart.Provider data={candle_data} >
                    <CandlestickChart height={screenWidth / 2} width={screenWidth}>
                      <CandlestickChart.Candles />
                      <CandlestickChart.Crosshair>
                        <CandlestickChart.Tooltip />
                      </CandlestickChart.Crosshair>
                    </CandlestickChart>
                    <CandlestickChart.DatetimeText
                      style={{ color: "white", fontWeight: "600", margin: 10 }}
                    />
                  </CandlestickChart.Provider>
                )
            }

          </VStack>
        </ScrollView>
      )
  );
}

export default CoinDetailedScreen;