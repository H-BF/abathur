        CREATE OR REPLACE FUNCTION get_sg_id(sg_name varchar) RETURNS integer AS $$
            BEGIN
                    RETURN (SELECT id FROM sgroups.tbl_sg WHERE name = sg_name);
            END
        $$ LANGUAGE plpgsql;

        DO $$
            BEGIN
                INSERT INTO
                    sgroups.tbl_sg(name)
                VALUES
                    ('${PREFIX}-sg-0'),
                    ('${PREFIX}-sg-1'),
                    ('${PREFIX}-sg-2'),
                    ('${PREFIX}-sg-3'),
                    ('${PREFIX}-sg-4'),
                    ('${PREFIX}-sg-5');

                INSERT INTO
                    sgroups.tbl_network(name, network, sg)
                VALUES
                    ('${PREFIX}-nw-0', '29.64.4.220/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-1', '29.64.4.221/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-2', '29.64.4.222/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-3', '29.64.4.223/32', get_sg_id('${PREFIX}-sg-1')),
                    ('${PREFIX}-nw-4', '29.64.4.224/32', get_sg_id('${PREFIX}-sg-2')),
                    ('${PREFIX}-nw-5', '29.64.4.225/32', get_sg_id('${PREFIX}-sg-3')),
                    ('${PREFIX}-nw-6', '29.64.4.226/32', get_sg_id('${PREFIX}-sg-3')),
                    ('${PREFIX}-nw-7', '29.64.4.227/32', get_sg_id('${PREFIX}-sg-4')),
                    ('${PREFIX}-nw-8', '29.64.4.228/32', get_sg_id('${PREFIX}-sg-5')),
                    ('${PREFIX}-nw-9', '29.64.4.229/32', get_sg_id('${PREFIX}-sg-5'));

                INSERT INTO
                    sgroups.tbl_cidr_sg_rule(proto, cidr, sg, traffic, ports, logs, trace)
                VALUES
                    (
                        'tcp',
                        '29.64.4.240/32',
                        get_sg_id('${PREFIX}-sg-0'),
                        'ingress',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(50000, 50001))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     ),
                    (
                        'udp',
                        '29.64.4.241/32',
                        get_sg_id('${PREFIX}-sg-1'),
                        'ingress',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(50001, 50004))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     ),
                    (
                        'tcp',
                        '29.64.4.242/32',
                        get_sg_id('${PREFIX}-sg-3'),
                        'ingress',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(50004,50005),int4range(50006,50007),int4range(50008,50011))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     ),
                    (
                        'udp',
                        '29.64.4.243/32',
                        get_sg_id('${PREFIX}-sg-4'),
                        'egress',
                        ARRAY[
                            ((int4multirange(int4range(41000, 41001))), (int4multirange(int4range(51001, 51002)))),
                            ((int4multirange(int4range(41002, 41003))), (int4multirange(int4range(51003, 51006)))),
                            ((int4multirange(int4range(41006, 41007))), (int4multirange(int4range(51007, 51008),int4range(51009,51010),int4range(51011,51014))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     ),
                    (
                        'tcp',
                        '29.64.4.244/32',
                        get_sg_id('${PREFIX}-sg-5'),
                        'egress',
                        ARRAY[
                            ((int4multirange(int4range(42000, 42003))), (int4multirange(int4range(52003, 52004)))),
                            ((int4multirange(int4range(42004, 42007))), (int4multirange(int4range(52007, 52010)))),
                            ((int4multirange(int4range(42010, 42013))), (int4multirange(int4range(52013, 52014),int4range(52015,52016),int4range(52017,52020))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     ),
                    (
                        'tcp',
                        '29.64.4.245/32',
                        get_sg_id('${PREFIX}-sg-2'),
                        'egress',
                        ARRAY[
                            ((int4multirange(int4range(43000,43001),int4range(43002,43003),int4range(43004,43007))), (int4multirange(int4range(53005,53006)))),
                            ((int4multirange(int4range(43008,43009),int4range(43010,43011),int4range(43012,43015))), (int4multirange(int4range(53011,53014)))),
                            ((int4multirange(int4range(43016, 43021))), (int4multirange(int4range(53019,53024))))
                        ]::sgroups.sg_rule_ports[],
                        true,
                        true
                     );

                    INSERT INTO
                        sgroups.tbl_sync_status(total_affected_rows)
                    VALUES
                        (1);
            COMMIT;
        END $$;