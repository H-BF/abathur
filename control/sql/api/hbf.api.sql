        DO $$
            BEGIN
            INSERT INTO sgroups.tbl_sg(name)
            VALUES ('sg-0'),('sg-1'),('sg-2'),('sg-3'),('sg-4');
            INSERT INTO
                sgroups.tbl_network(name, network, sg)
            VALUES
                ('nw-0', '10.150.0.220/32', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0')),
                ('nw-1', '10.150.0.221/32', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0')),
                ('nw-2', '10.150.0.222/32', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1')),
                ('nw-3', '10.150.0.223/32', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2')),
                ('nw-4', '10.150.0.224/32', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3')),
                ('nw-5', '20.150.0.224/28', (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'));
            INSERT INTO
                sgroups.tbl_ie_sg_sg_icmp_rule(ip_v, types, sg_local, sg, traffic, logs, trace, action, priority)
            VALUES
                (
                    'IPv4',
                    '{255}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'ingress',
                    true,
                    true,
                    'DROP',
                    -100
                ),
                (
                    'IPv4',
                    '{252,253}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'egress',
                    false,
                    false,
                    'ACCEPT',
                    32767
                ),
                (
                    'IPv6',
                    '{200,201,202}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'ingress',
                    false,
                    true,
                    'ACCEPT',
                    -32768
                ),
               (
                    'IPv6',
                    '{203}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'egress',
                    true,
                    false,
                    'DROP',
                    NULL
                );
            INSERT INTO
                sgroups.tbl_cidr_sg_icmp_rule(ip_v, types, cidr, sg, traffic, logs, trace, action, priority)
            VALUES
                (
                    'IPv4',
                    '{255}'::sgroups.icmp_types,
                    '188.234.6.40/32',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'ingress',
                    true,
                    true,
                    'ACCEPT',
                    200
                ),
                (
                    'IPv4',
                    '{250,251}'::sgroups.icmp_types,
                    '188.234.0.0/20',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'egress',
                    true,
                    false,
                    'DROP',
                    1000
                ),
                (
                    'IPv6',
                    '{100,101,102}'::sgroups.icmp_types,
                    'fe80:0000:0000:0000::/64',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'ingress',
                    false,
                    true,
                    'ACCEPT',
                    -1000
                ),
               (
                    'IPv6',
                    '{140}'::sgroups.icmp_types,
                    'fe80::18b4:3f6c:1816:719a/128',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'egress',
                    false,
                    false,
                    'DROP',
                    NULL
                );
            INSERT INTO
                sgroups.tbl_ie_sg_sg_rule(proto, sg_local, sg, traffic, ports, logs, trace, action, priority)
            VALUES
                (
                    'tcp',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'ingress',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(60000,60001))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    true,
                    'DROP',
                    0
                ),
                (
                    'tcp',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'egress',
                    ARRAY[
                        ((int4multirange(int4range(45000, 45001))), (int4multirange(int4range(55000, 55001)))),
                        ((int4multirange(int4range(45001, 45002))), (int4multirange(int4range(55001, 55501), int4range(55502, 55503)))),
                        ((int4multirange(int4range(45002, 45003))), (int4multirange(int4range(56000, 56501))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    false,
                    'ACCEPT',
                    0
                ),
                (
                    'udp',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'ingress',
                    ARRAY[
                        ((int4multirange(int4range(46000, 46071))), (int4multirange(int4range(57000, 57301))))
                    ]::sgroups.sg_rule_ports[],
                    false,
                    true,
                    'ACCEPT',
                    -32768
                ),
                (
                    'udp',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'egress',
                    ARRAY[
                        ((int4multirange(int4range(47771, 47772), int4range(47000, 47600))), (int4multirange(int4range(57400, 57401), int4range(57500, 57701)))),
                        ((int4multirange(int4range(48000, 48001), int4range(48500, 49001))), (int4multirange(int4range(59000, 59001))))
                    ]::sgroups.sg_rule_ports[],
                    false,
                    false,
                    'DROP',
                    32767
                ),
                (
                    'tcp',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'ingress',
                    ARRAY[
                        ((int4multirange(int4range(46000, 46071))), (int4multirange(int4range(57000, 57301))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    true,
                    'DROP',
                    NULL
                );
            INSERT INTO
                sgroups.tbl_sg_rule(sg_from, sg_to, proto, ports, action, priority)
            VALUES
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(5000, 5001))))
                    ]::sgroups.sg_rule_ports[],
                    'ACCEPT',
                    -200
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(5600, 5901))))
                    ]::sgroups.sg_rule_ports[],
                    'DROP',
                    -200
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(4444, 4445))), (int4multirange(int4range(7000, 7001)))),
                        ((int4multirange(int4range(4445, 4446))), (int4multirange(int4range(7300, 7501)))),
                        ((int4multirange(int4range(4446, 4447))), (int4multirange(int4range(7600, 7701), int4range(7800, 7801))))
                    ]::sgroups.sg_rule_ports[],
                    'DROP',
                    1
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(9999, 10051))), (int4multirange(int4range(23000, 23501))))
                    ]::sgroups.sg_rule_ports[],
                    'ACCEPT',
                    2
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(8888, 8889), int4range(1000, 2001))), (int4multirange(int4range(55000, 55001), int4range(56000, 57001)))),
                        ((int4multirange(int4range(7777, 7778), int4range(45000, 46001))), (int4multirange(int4range(60000, 60001))))
                    ]::sgroups.sg_rule_ports[],
                    'DROP',
                    NULL
                );
            INSERT INTO
                sgroups.tbl_fqdn_rule(sg_from, fqdn_to, proto, ports, logs, ndpi_protocols, action, priority)
            VALUES
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'google.com',
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(4446, 4447))), (int4multirange(int4range(7600, 7701), int4range(7800, 7801))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    ARRAY['http', 'ssh']::citext[],
                    'DROP',
                    100
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'yandex.ru',
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(8888, 8889), int4range(1000, 2001))), (int4multirange(int4range(55000, 55001), int4range(56000, 57001)))),
                        ((int4multirange(int4range(7777, 7778), int4range(45000, 46001))), (int4multirange(int4range(60000, 60001))))
                    ]::sgroups.sg_rule_ports[],
                    false,
                    '{}'::citext[],
                    'ACCEPT',
                    5000
                );
            INSERT INTO
                sgroups.tbl_sg_icmp_rule (ip_v, types, sg, logs, trace, action)
            VALUES
                ('IPv4', '{0}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'), true, true, 'DROP'),
                ('IPv4', '{10,255}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'), true, false, 'ACCEPT'),
                ('IPv6', '{0,8,100}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'), false, true, 'DROP'),
                ('IPv6', '{15}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'), false, false, 'ACCEPT');
            INSERT INTO
                sgroups.tbl_sg_sg_icmp_rule (ip_v, types, sg_from, sg_to, logs, trace, action, priority)
            VALUES
                (
                    'IPv4',
                    '{0}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    true,
                    true,
                    'ACCEPT',
                    -32768
                ),
                (
                    'IPv6',
                    '{8,10}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    true,
                    false,
                    'DROP',
                    32767
                ),
                (
                    'IPv4',
                    '{255,3,111}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    false,
                    true,
                    'ACCEPT',
                    -300
                ),
                (
                    'IPv6',
                    '{8}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    false,
                    false,
                    'ACCEPT',
                    -300
                ),
                (
                    'IPv4',
                    '{100,101,102}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    true,
                    true,
                    'DROP',
                    NULL
                );
            INSERT INTO
                sgroups.tbl_cidr_sg_rule (proto, cidr, sg, traffic, ports, logs, trace, action, priority)
            VALUES
                (
                    'tcp',
                    '10.10.0.8/30',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'egress',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(5000, 5001))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    true,
                    'DROP',
                    300
                ),
                (
                    'tcp',
                    '240.0.0.0/24',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'egress',
                    ARRAY[
                        ((int4multirange(int4range(4444, 4445))), (int4multirange(int4range(7000, 7001)))),
                        ((int4multirange(int4range(4445, 4446))), (int4multirange(int4range(7300, 7501)))),
                        ((int4multirange(int4range(4446, 4447))), (int4multirange(int4range(7600, 7701), int4range(7800, 7801))))
                    ]::sgroups.sg_rule_ports[],
                    true,
                    false,
                    'ACCEPT',
                    -32000
                ),
                (
                    'udp',
                    '21.21.0.240/28',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'ingress',
                    ARRAY[
                        ((int4multirange(int4range(9999, 10051))), (int4multirange(int4range(23000, 23501))))
                    ]::sgroups.sg_rule_ports[],
                    false,
                    true,
                    'ACCEPT',
                    300
                ),
                (
                    'udp',
                    '65.65.0.0/16',
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'ingress',
                    ARRAY[
                        ((int4multirange(int4range(8888, 8889), int4range(1000, 2001))), (int4multirange(int4range(55000, 55001), int4range(56000, 57001)))),
                        ((int4multirange(int4range(7777, 7778), int4range(45000, 46001))), (int4multirange(int4range(60000, 60001))))
                    ]::sgroups.sg_rule_ports[],
                    false,
                    false,
                    'DROP',
                    0
                );
            COMMIT;
        END $$;
