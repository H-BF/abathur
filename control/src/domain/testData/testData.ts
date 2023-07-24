export const networks = {
    "networks": {
      "networks": [
        {
          "name": "nw-0",
          "network": {
            "CIDR": "10.150.0.220/32"
          }
        },
        {
          "name": "nw-1",
          "network": {
            "CIDR": "10.150.0.221/32"
          }
        },
        {
          "name": "nw-2",
          "network": {
            "CIDR": "10.150.0.222/32"
          }
        },
        {
          "name": "nw-3",
          "network": {
            "CIDR": "10.150.0.223/32"
          }
        },
        {
          "name": "nw-4",
          "network": {
            "CIDR": "10.150.0.224/32"
          }
        },
        {
          "name": "nw-5",
          "network": {
            "CIDR": "10.150.0.225/32"
          }
        },
        {
          "name": "nw-6",
          "network": {
            "CIDR": "10.150.0.226/32"
          }
        },
        {
          "name": "nw-7",
          "network": {
            "CIDR": "10.150.0.227/32"
          }
        },
        {
          "name": "nw-8",
          "network": {
            "CIDR": "10.150.0.228/32"
          }
        },
        {
          "name": "nw-9",
          "network": {
            "CIDR": "10.150.0.229/32"
          }
        },
        {
          "name": "infra/report-server",
          "network": {
              "CIDR": "10.150.0.230/32"
          }
        }
      ]
    },
    "syncOp": "FullSync"
  }

export const sg = {
    "groups": {
      "groups": [
        {
          "name": "sg-0",
          "networks": [
              "nw-0", "nw-1", "nw-2"
          ]
        },
        {
          "name": "sg-1",
          "networks": [
              "nw-3"
          ]
        },
        {
          "name": "sg-2",
          "networks": [
              "nw-4"
          ]
        },
        {
          "name": "sg-3",
          "networks": [
              "nw-5", "nw-6"
          ]
        },
        {
          "name": "sg-4",
          "networks": [
              "nw-7"
          ]
        },
        {
          "name": "sg-5",
          "networks": [
              "nw-8", "nw-9"
          ]
        },
        {
          "name": "infra/report-server",
          "networks": [
              "infra/report-server"
          ]
        }
      ]
    },
    "syncOp": "FullSync"
  }

export const rules = {
    "sgRules": {
      "rules": [
        {
          "ports": [
            {
              "s": "",
              "d": "50000"
            }
          ],
          "sgFrom": "sg-0",
          "sgTo": "sg-1",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "50001-50003"
            }
          ],
          "sgFrom": "sg-1",
          "sgTo": "sg-2",
          "transport": "TCP"
        },
         {
          "ports": [
            {
              "s": "",
              "d": "50004, 50006, 50008-50010"
            }
          ],
          "sgFrom": "sg-3",
          "sgTo": "sg-5",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "41000",
              "d": "51001"
            },
            {
              "s": "41002",
              "d": "51003-51005"
            },
            {
              "s": "41006",
              "d": "51007, 51009, 51011-51013"
            }
          ],
          "sgFrom": "sg-4",
          "sgTo": "sg-0",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "42000-42002",
              "d": "52003"
            },
            {
              "s": "42004-42006",
              "d": "52007-52009"
            },
            {
              "s": "42010-42012",
              "d": "52013, 52015, 52017-52019"
            }
          ],
          "sgFrom": "sg-5",
          "sgTo": "sg-2",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "43000, 43002, 43004-43006",
              "d": "53005"
            },
            {
              "s": "43008, 43010, 43012-43014",
              "d": "53011-53013"
            },
            {
              "s": "43016, 43017, 43018-43020",
              "d": "53019, 53020, 53021-53023"
            }
          ],
          "sgFrom": "sg-2",
          "sgTo": "sg-1",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "9091"
            }
          ],
          "sgFrom": "sg-1",
          "sgTo": "infra/report-server",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "9091"
            }
          ],
          "sgFrom": "sg-2",
          "sgTo": "infra/report-server",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "9091"
            }
          ],
          "sgFrom": "sg-3",
          "sgTo": "infra/report-server",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "9091"
            }
          ],
          "sgFrom": "sg-4",
          "sgTo": "infra/report-server",
          "transport": "TCP"
        },
        {
          "ports": [
            {
              "s": "",
              "d": "9091"
            }
          ],
          "sgFrom": "sg-5",
          "sgTo": "infra/report-server",
          "transport": "TCP"
        }
      ]
    },
    "syncOp": "FullSync"
}