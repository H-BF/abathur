        DO $$
            BEGIN 
            INSERT INTO sgroups.tbl_sg(name) VALUES ('sg-0'),('sg-1'),('sg-2'),('sg-3'),('sg-4');
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
                sgroups.tbl_sg_rule(sg_from, sg_to, proto, ports)
            VALUES
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(5000, 5001))))
                    ]::sgroups.sg_rule_ports[]
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(5600, 5901))))
                    ]::sgroups.sg_rule_ports[]
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(4444, 4445))), (int4multirange(int4range(7000, 7001)))),
                        ((int4multirange(int4range(4445, 4446))), (int4multirange(int4range(7300, 7501)))),
                        ((int4multirange(int4range(4446, 4447))), (int4multirange(int4range(7600, 7701), int4range(7800, 7801))))
                    ]::sgroups.sg_rule_ports[]
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(9999, 10051))), (int4multirange(int4range(23000, 23501))))
                    ]::sgroups.sg_rule_ports[]
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-4'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(8888, 8889), int4range(1000, 2001))), (int4multirange(int4range(55000, 55001), int4range(56000, 57001)))),
                        ((int4multirange(int4range(7777, 7778), int4range(45000, 46001))), (int4multirange(int4range(60000, 60001))))
                    ]::sgroups.sg_rule_ports[]
                );
            INSERT INTO
                sgroups.tbl_fqdn_rule(sg_from, fqdn_to, proto, ports, logs)
            VALUES
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    'google.com',
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(4446, 4447))), (int4multirange(int4range(7600, 7701), int4range(7800, 7801))))
                    ]::sgroups.sg_rule_ports[],
                    true
                ),
                (
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    'yandex.ru',
                    'udp',
                    ARRAY[
                        ((int4multirange(int4range(8888, 8889), int4range(1000, 2001))), (int4multirange(int4range(55000, 55001), int4range(56000, 57001)))),
                        ((int4multirange(int4range(7777, 7778), int4range(45000, 46001))), (int4multirange(int4range(60000, 60001))))
                    ]::sgroups.sg_rule_ports[],
                    false
                );
            INSERT INTO
                sgroups.tbl_sg_icmp_rule (ip_v, types, sg, logs, trace)
            VALUES
                ('IPv4', '{0}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'), true, true),
                ('IPv4', '{10,255}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'), true, false),
                ('IPv6', '{0,8,100}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'), false, true),
                ('IPv6', '{15}'::sgroups.icmp_types, (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'), false, false);
            INSERT INTO
                sgroups.tbl_sg_sg_icmp_rule (ip_v, types, sg_from, sg_to, logs, trace)
            VALUES
                (
                    'IPv4',
                    '{0}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    true,
                    true
                ),
                (
                    'IPv6',
                    '{8,10}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    true,
                    false
                ),
                (
                    'IPv4',
                    '{255,3,111}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-1'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    false,
                    true
                ),
                (
                    'IPv6',
                    '{8}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-3'),
                    false,
                    false
                ),
                (
                    'IPv4',
                    '{100,101,102}'::sgroups.icmp_types,
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-2'),
                    (SELECT id FROM sgroups.tbl_sg WHERE name = 'sg-0'),
                    true,
                    true
                );
            COMMIT;
        END $$;