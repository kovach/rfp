{-# LANGUAGE OverloadedStrings #-}
import Web.Scotty
import Network.Wai.Middleware.Static

main = scotty 3000 $ do
  middleware $ staticPolicy (noDots >-> addBase "static")
  get "/" $ do
    file "record.html"
