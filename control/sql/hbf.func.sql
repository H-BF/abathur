        CREATE OR REPLACE FUNCTION get_sg_id(sg_name varchar) RETURNS integer AS $$
            BEGIN
                    RETURN (SELECT id FROM sgroups.tbl_sg WHERE name = sg_name);
            END
        $$ LANGUAGE plpgsql;
        
        DO $$
            BEGIN
                INSERT INTO sgroups.tbl_sg(name) VALUES ('sg-0'),('sg-1'),('sg-2'),('sg-3'),('sg-4'),('sg-5'),('infra/report-server'),('infra/abathur-control');
        
                INSERT INTO
                    sgroups.tbl_network(name, network, sg)
                VALUES
                    ('nw-0', '29.64.0.220/32', get_sg_id('sg-0')),
                    ('nw-1', '29.64.0.221/32', get_sg_id('sg-0')),
                    ('nw-2', '29.64.0.222/32', get_sg_id('sg-0')),
                    ('nw-3', '29.64.0.223/32', get_sg_id('sg-1')),
                    ('nw-4', '29.64.0.224/32', get_sg_id('sg-2')),
                    ('nw-5', '29.64.0.225/32', get_sg_id('sg-3')),
                    ('nw-6', '29.64.0.226/32', get_sg_id('sg-3')),
                    ('nw-7', '29.64.0.227/32', get_sg_id('sg-4')),
                    ('nw-8', '29.64.0.228/32', get_sg_id('sg-5')),
                    ('nw-9', '29.64.0.229/32', get_sg_id('sg-5')),
                    ('infra/report-server', 'HBF_REPORTER_HOST/32', get_sg_id('infra/report-server')),
                    ('infra/abathur-control', 'ABA_CONTROL_IP/32', get_sg_id('infra/abathur-control'));
        
                INSERT INTO
                    sgroups.tbl_sg_rule(sg_from, sg_to, proto, ports)
                VALUES
                    (
                    get_sg_id('sg-0'),
                    get_sg_id('sg-1'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(50000, 50001))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                    get_sg_id('sg-1'),
                    get_sg_id('sg-2'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(50001, 50004))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                    get_sg_id('sg-3'),
                    get_sg_id('sg-5'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(NULL))), (int4multirange(int4range(50004,50005),int4range(50006,50007),int4range(50008,50011))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                    get_sg_id('sg-4'),
                    get_sg_id('sg-0'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(41000, 41001))), (int4multirange(int4range(51001, 51002)))),
                        ((int4multirange(int4range(41002, 41003))), (int4multirange(int4range(51003, 51006)))),
                        ((int4multirange(int4range(41006, 41007))), (int4multirange(int4range(51007, 51008),int4range(51009,51010),int4range(51011,51014))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                    get_sg_id('sg-5'),
                    get_sg_id('sg-2'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(42000, 42003))), (int4multirange(int4range(52003, 52004)))),
                        ((int4multirange(int4range(42004, 42007))), (int4multirange(int4range(52007, 52010)))),
                        ((int4multirange(int4range(42010, 42013))), (int4multirange(int4range(52013, 52014),int4range(52015,52016),int4range(52017,52020))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                    get_sg_id('sg-2'),
                    get_sg_id('sg-1'),
                    'tcp',
                    ARRAY[
                        ((int4multirange(int4range(43000,43001),int4range(43002,43003),int4range(43004,43007))), (int4multirange(int4range(53005,53006)))),
                        ((int4multirange(int4range(43008,43009),int4range(43010,43011),int4range(43012,43015))), (int4multirange(int4range(53011,53014)))),
                        ((int4multirange(int4range(43016, 43021))), (int4multirange(int4range(53019,53024))))
                    ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-0'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-1'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-2'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-3'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-4'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-5'),
                        get_sg_id('infra/report-server'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(HBF_REPORTER_PORT_FROM, HBF_REPORTER_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-0'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                                (
                        get_sg_id('sg-1'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-2'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-3'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-4'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    ),
                    (
                        get_sg_id('sg-5'),
                        get_sg_id('infra/abathur-control'),
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(ABA_CONTROL_PORT_FROM, ABA_CONTROL_PORT_TO))))
                        ]::sgroups.sg_rule_ports[]
                    );
            COMMIT;
        END $$;